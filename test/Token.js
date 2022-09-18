const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = function (n) {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Token', function () {

    let token, accounts, deployer, receiver;

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

            it('throws error if insufficient balance', async function() {
                const invalidAmount = tokens(100000000);
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;
            })

            it('throws error if invalid recipient', async function () {
                const amount = tokens(100);
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted;
            })
        })
    })
});
