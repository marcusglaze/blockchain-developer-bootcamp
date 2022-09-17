const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = function (n) {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Token', function () {

    let token;

    this.beforeEach(async function () {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy(
            'Dapp University',
            'DAPP',
            1000000
        );
    });

    describe('Deployment', function () {
        const name = 'Dapp University';
        const symbol = 'DAPP';
        const decimals = 18;
        const totalSupply = 1000000;

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
            expect(await token.totalSupply()).to.equal(tokens(totalSupply));
        });  
    })
});