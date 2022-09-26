import { useEffect } from 'react';
import { ethers } from 'ethers';
import '../App.css';

const config = require('../config.json');

const TOKEN_ABI = require('../abis/Token.json').abi;
const EXCHANGE_ABI = require('../abis/Exchange.json').abi;

function App() {

  const loadBlockchainData = async () => {
    // gets metamask connection
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    console.log(accounts[0]);

    // connect ethers to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    console.log(chainId)

    const token = new ethers.Contract(config[chainId].dApp.address, TOKEN_ABI, provider);
    console.log(token.address);
    console.log(await token.symbol());
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
