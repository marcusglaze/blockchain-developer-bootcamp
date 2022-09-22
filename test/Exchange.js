const { expect } = require('chai');
const { ethers } = require('hardhat');
const { result } = require('lodash');

const tokens = function (n) {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Exchange', function () {

    let exchange, feeAccount, deployer, user1, user2, token1, token2;

    const feePercent = 10;

    this.beforeEach(async function () {
        const Exchange = await ethers.getContractFactory('Exchange');
        const Token = await ethers.getContractFactory('Token');

        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        user2 = accounts[3];
        
        exchange = await Exchange.deploy(feeAccount.address, feePercent);
        token1 = await Token.deploy(
            'Dapp University',
            'DAPP',
            1000000
        );
        token2 = await Token.deploy(
            'Mock Wrapped Ether',
            'mEth',
            10000000
        );

        // transfer tokens to the user
        let transaction = await token1.connect(deployer).transfer(user1.address, tokens(1000));
        await transaction.wait();
    })

    describe('Deployment', function () {
        it('tracks the fee account', async function () {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        })

        it('tracks the fee percent', async function () {
            expect(await exchange.feePercent()).to.equal(feePercent);
        })
    })

    describe('Deposit Tokens', function () {

        let transaction, result;
        let amount = tokens(10);

        describe('Success', function () {

            this.beforeEach(async function () {
                // approve tokens
                await token1.connect(user1).approve(exchange.address, amount);
                // deposit tokens
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait();
            })

            it('tracks the token deposit', async function () {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
            })

            it('updates user balance', async function () {
                expect(await exchange.tokens(user1.address, token1.address)).to.equal(amount);
            })

            it('emits a deposit event', async function () {
                expect(result.events[1].event).to.equal('Deposit');
                expect(result.events[1].args.token).to.equal(token1.address);
                expect(result.events[1].args.user).to.equal(user1.address);
                expect(result.events[1].args.amount).to.equal(amount);
                expect(result.events[1].args.balance).to.equal(amount);
            })
        })

        describe('Failure', function () {
            it('fails when no tokens are approved', async function () {
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted;
            })
        })
    })

    describe('Withdraw Tokens', function () {

        let transaction, result;
        let amount = tokens(100);

        this.beforeEach(async function () {
            // approve tokens
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();
            // deposit tokens
            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            result = await transaction.wait();
        })

        describe('Success', async function () {

            this.beforeEach(async function () {
                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount);
                result = await transaction.wait();
            })

            it('withdraws token funds from exchange', async function () {
                expect(await token1.balanceOf(exchange.address)).to.equal(0);
            })
            it('updates user balance on exchange', async function () {
                expect(await exchange.tokens(user1.address, token1.address)).to.equal(0);
            })
            it('emits a withdraw event', async function () {
                expect(result.events[1].event).to.equal('Withdraw');
                expect(result.events[1].args.token).to.equal(token1.address);
                expect(result.events[1].args.user).to.equal(user1.address);
                expect(result.events[1].args.amount).to.equal(amount);
                expect(result.events[1].args.balance).to.equal(0);
            })
        })

        describe('Failure', async function () {

            it('rejects insufficient funds', async function () {
                await (expect(exchange.connect(user1).withdrawToken(token1.address, tokens(10000)))).to.be.reverted;
            })
        })
    })

    describe('Make Orders', function () {

        let transaction, result;
        let amount = tokens(100);

        describe('Success', function () {

            this.beforeEach(async function () {
                // approve tokens
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
                // deposit tokens
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait();
                // make order
                transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(100), token1.address, tokens(10));
                result = await transaction.wait();
            })

            it('increments orders count', async function () {
                expect(await exchange.ordersCount()).to.equal(1);
            })
            it('tracks new order', async function () {
                const order = await exchange.orders(1);
                expect(order.id).to.equal(1);
                expect(order.user).to.equal(user1.address);
                expect(order.tokenGet).to.equal(token2.address);
                expect(order.amountGet).to.equal(tokens(100));
                expect(order.tokenGive).to.equal(token1.address);
                expect(order.amountGive).to.equal(tokens(10));
            })
            it('emits an Order event', async function () {
                expect(result.events[0].event).to.equal('Order');
                expect(result.events[0].args.order.id).to.equal(1);
                expect(result.events[0].args.order.user).to.equal(user1.address);
                expect(result.events[0].args.order.tokenGet).to.equal(token2.address);
                expect(result.events[0].args.order.amountGet).to.equal(tokens(100));
                expect(result.events[0].args.order.tokenGive).to.equal(token1.address);
                expect(result.events[0].args.order.amountGive).to.equal(tokens(10));
                expect(result.events[0].args.order.timestamp).to.at.least(1);
            })
        })
        
        describe('Failure', function () {
            it('rejects making order with insufficient funds', async function () {
                await (expect(exchange.connect(user1).makeOrder(token2.address, tokens(100), token1.address, tokens(10)))).to.be.reverted;
            })
        })
    })

    describe('Order Actions', function () {

        let transaction, result;
        let amount = tokens(100);

        this.beforeEach(async function () {
            // approve tokens
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();
            // deposit tokens
            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            result = await transaction.wait();
            // make order
            transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(100), token1.address, tokens(10));
            result = await transaction.wait();
        })

        describe('Cancelling Orders', function () {
            let transaction, result;
            let amount = tokens(100);

            describe('Success', function () {

                this.beforeEach(async function () {
                    // cancel order
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    result = await transaction.wait();
                })

                it('cancels order', async function () {
                    expect(await exchange.orderCancelled(1)).to.equal(true);
                })
                it('emits a Cancel event', async function () {
                    expect(result.events[0].event).to.equal('Cancel');
                    expect(result.events[0].args.order.id).to.equal(1);
                    expect(result.events[0].args.order.user).to.equal(user1.address);
                    expect(result.events[0].args.order.tokenGet).to.equal(token2.address);
                    expect(result.events[0].args.order.amountGet).to.equal(tokens(100));
                    expect(result.events[0].args.order.tokenGive).to.equal(token1.address);
                    expect(result.events[0].args.order.amountGive).to.equal(tokens(10));
                    expect(result.events[0].args.order.timestamp).to.at.least(1);
                })
            })

            describe('Failure', function () {
                it('rejects invalid order id', async function () {
                    await (expect(exchange.connect(user1).cancelOrder(100))).to.be.reverted;
                })
                it('rejects cancelling other users orders', async function () {
                    await (expect(exchange.connect(user2).cancelOrder(1))).to.be.reverted;
                })
            })
        })
    })
})
