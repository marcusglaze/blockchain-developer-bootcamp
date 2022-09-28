import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import '../App.css';
import config from '../config.json';
import { 
  loadProvider, 
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange } from '../store/interactions';

import Navbar from './Navbar';

function App() {

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // connect ethers to blockchain
    const provider = loadProvider(dispatch);

    // fetch current network's chainID
    const { chainId } = await loadNetwork(provider, dispatch);

    // reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })

    // fetch current account & balance from Metamask
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch);
    })
    

    // load token smart contracts
    const dApp = config[chainId].dApp;
    const mEth = config[chainId].mEth;
    await loadTokens(provider, [dApp.address, mEth.address], dispatch);

    // load exchange smart contract
    const exchange = config[chainId].exchange;
    await loadExchange(provider, exchange.address, dispatch);
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}
      <Navbar/>

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
