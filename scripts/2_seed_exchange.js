const { ethers } = require("hardhat");
const hre = require("hardhat");

const config = require('../src/config.json');

const tokens = function (n) {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

const wait = function (seconds) {
  const milliseconds = seconds * 1000;
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main() {

  // Fetch accounts from wallet - these are unlocked
  const accounts = await ethers.getSigners();

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork();
  console.log('Using chainId: ', chainId);

  // Fetch deployed tokens
  const dApp = await ethers.getContractAt('Token', config[chainId].dApp.address);
  const mDai = await ethers.getContractAt('Token', config[chainId].mDai.address);
  const mEth = await ethers.getContractAt('Token', config[chainId].mEth.address);
  
  console.log(`Dapp token fetched: ${dApp.address}`);
  console.log(`mDai token fetched: ${mDai.address}`);
  console.log(`mEth token fetched: ${mEth.address}\n`);

  // Fetch the deployed exchange
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
  console.log(`Exchange fetched: ${exchange.address}\n`);

  // Give tokens to account[1]
  console.log("Allocating tokens...");
  const sender = accounts[0];
  const receiver = accounts[1];
  let amount = tokens(10000);

  // user1 transfers 10,000 mEth
  let transaction, result;
  transaction = await mEth.connect(sender).transfer(receiver.address, amount);
  console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`);

  // setup exchange users
  const user1 = accounts[0];
  const user2 = accounts[1];
  
  // user1 approves 10,000 DAPP
  transaction = await dApp.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user1.address}`);

  // user1 deposits 10,000 DAPP
  transaction = await exchange.connect(user1).depositToken(dApp.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} tokens from ${user1.address}`);

  // user2 approves 10,000 mETH
  transaction = await mEth.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user2.address}`);

  // user2 deposits 10,000 mETH
  transaction = await exchange.connect(user2).depositToken(mEth.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} tokens from ${user2.address}\n`);

  //////////////////////////////////////////////////////
  // Seed a cancelled order
  //
  
  // user1 makes order to get tokens
  let orderId;
  transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(100), dApp.address, tokens(5));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  orderId = result.events[0].args.order.id;
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Cancelled order from ${user1.address}\n`);

  await wait(1);

  //////////////////////////////////////////////////////
  // Seed a filled order
  //
  
  // User 1 makes order to get tokens
  transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(100), dApp.address, tokens(10));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  // User 2 fills order
  orderId = result.events[0].args.order.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user1.address}`);

  await wait(1);

  // User 1 makes another order
  transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(50), dApp.address, tokens(15));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  // User 2 fills another order
  orderId = result.events[0].args.order.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user1.address}`);

  await wait(1);

  // User 1 makes another order
  transaction = await exchange.connect(user1).makeOrder(mEth.address, tokens(200), dApp.address, tokens(20));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  // User 2 fills another order
  orderId = result.events[0].args.order.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user1.address}\n`);

  await wait(1);


  //////////////////////////////////////////////////////
  // Seed open orders
  //

  // User 1 makes 10 orders
  for (let i = 1; i <= 10; i++)
  {
    const amount = tokens(i * 10);
    transaction = await exchange.connect(user1).makeOrder(mEth.address, amount, dApp.address, tokens(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}`);
    await wait(1);
  }

  // User 2 makes 10 orders
  for (let i = 1; i <= 10; i++)
  {
    const amount = tokens(i * 10);
    transaction = await exchange.connect(user2).makeOrder(dApp.address, tokens(10), mEth.address, amount);
    result = await transaction.wait();
    console.log(`Made order from ${user2.address}`);
    await wait(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
