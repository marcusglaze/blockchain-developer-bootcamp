const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = function (n) {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Exchange', function () {

    let exchange, feeAccount, deployer;

    const feePercent = 10;

    this.beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        
        const Exchange = await ethers.getContractFactory('Exchange');
        exchange = await Exchange.deploy(feeAccount.address, feePercent);
    })

    describe('Deployment', function () {
        it('tracks the fee account', async function () {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        })

        it('tracks the fee percent', async function () {
            expect(await exchange.feePercent()).to.equal(feePercent);
        })
    })
})