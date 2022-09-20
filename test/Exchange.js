const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = function (n) {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Exchange', function () {

    let exchange, feeAccount, deployer, user1, user2, token1;

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
})