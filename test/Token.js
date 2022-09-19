const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = function (n) {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Token', function () {

    let token, accounts, deployer, receiver, exchange;

    this.beforeEach(async function () {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy(
            'Dapp University',
            'DAPP',
            1000000
        );
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
        exchange = accounts[2];
    });

    describe('Deployment', function () {
        const name = 'Dapp University';
        const symbol = 'DAPP';
        const decimals = 18;
        const totalSupply = tokens(1000000);

        it('has correct name', async function () {
            expect(await token.name()).to.equal(name);
        });

        it('has correct symbol', async function () {
            expect(await token.symbol()).to.equal(symbol);
        });

        it('has correct decimals', async function () {
            expect(await token.decimals()).to.equal(decimals);
        });

        it('has correct total supply', async function () {
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it('assigns total supply to deployer', async function () {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        })
    })

    describe('Sending Tokens', function () {
        let amount, transaction, result;

        describe('Success Tests', function () {

            this.beforeEach(async function () {
                amount = tokens(100);
                transaction = await token.connect(deployer).transfer(receiver.address, amount);
                result = await transaction.wait();
            })
    
            it('tokens transfer successfully', async function () {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
                expect(await token.balanceOf(receiver.address)).to.equal(amount);
            })
    
            it('emits a transfer event', async function () {
                expect(result.events[0].event).to.equal('Transfer');
                expect(result.events[0].args._from).to.equal(deployer.address);
                expect(result.events[0].args._to).to.equal(receiver.address);
                expect(result.events[0].args._value).to.equal(amount);
            })
        })

        describe('Failure Tests', function () {

            it('rejects insufficient balance', async function() {
                const invalidAmount = tokens(100000000);
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;
            })

            it('rejects invalid recipient', async function () {
                const amount = tokens(100);
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted;
            })
        })
    })

    describe('Approving Tokens', function () {
        let amount, transaction, result;

        this.beforeEach(async function () {
            amount = tokens(100);
            transaction = await token.connect(deployer).approve(exchange.address, amount);
            result = await transaction.wait();
        })
        
        describe('Success Tests', function () {

            it('allocates an allowance for delegated token spending', async function () {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount);
            })

            it('emits an approval event', async function () {
                expect(result.events[0].event).to.equal('Approval');
                expect(result.events[0].args._owner).to.equal(deployer.address);
                expect(result.events[0].args._spender).to.equal(exchange.address);
                expect(result.events[0].args._value).to.equal(amount);
            })
        })

        describe('Failure Tests', function () {

            it('rejects invalid spender account', async function () {
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted;
            })
        })
    })

    describe('Delegated Token Transfers', function () {

        let amount, transaction, result;

        this.beforeEach(async function () {
            amount = tokens(100);
            await token.connect(deployer).approve(exchange.address, amount);
            //transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount);
            //result = transaction.wait();
        })

        describe('Success Tests', function () {

            this.beforeEach(async function () {
                transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount);
                result = await transaction.wait();
            })

            it('transfers tokens from approved address', async function () {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
                expect(await token.balanceOf(receiver.address)).to.equal(amount);
            })

            it('emits a transfer event', async function () {
                expect(result.events[0].event).to.equal('Transfer');
                expect(result.events[0].args._from).to.equal(deployer.address);
                expect(result.events[0].args._to).to.equal(receiver.address);
                expect(result.events[0].args._value).to.equal(amount);
            })

            it('updates allowance', async function () {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(tokens(0));
            })
        })

        describe('Failure Tests', function () {

            it('rejects transfer from non-approved address', async function () {
                await expect(token.connect(receiver).transferFrom(deployer.address, receiver.address, amount)).to.be.reverted;
            })

            it('rejects transfer with insufficient funds', async function () {
                await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, tokens(1000000000))).to.be.reverted;
            })
        })
    })
});
