const { ethers } = require("hardhat");

async function main() {
    // Fetch contract to deploy
    const Token = await ethers.getContractFactory("Token");

    // Deplot contract
    const token = await Token.deploy();
    await token.deployed();

    console.log(`Token Deployed to: ${token.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});