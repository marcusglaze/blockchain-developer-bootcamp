const { ethers } = require('hardhat');

async function main() {
    // Fetch contract to deploy
    console.log('Preparing deployment...\n');
    const Token = await ethers.getContractFactory('Token');
    const Exchange = await ethers.getContractFactory('Exchange');

    // Fetch Accounts
    const accounts = await ethers.getSigners();
    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n${accounts[2].address}\n`);

    // Deploy contract
    const dApp = await Token.deploy('Dapp University', 'DAPP', 1000000);
    await dApp.deployed();
    console.log(`DAPP Token Deployed to: ${dApp.address}`);

    const mDai = await Token.deploy('Mock Dai', 'mDAI', 10000000);
    await mDai.deployed();
    console.log(`mDAI Token Deployed to: ${mDai.address}`);

    const mEth = await Token.deploy('Mock Wrapped Ether', 'mETH', 10000000);
    await mEth.deployed();
    console.log(`mETH Token Deployed to: ${mEth.address}`);

    const exchange = await Exchange.deploy(accounts[1].address, 10);
    await exchange.deployed();
    console.log(`Exchange deployed to: ${exchange.address}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
