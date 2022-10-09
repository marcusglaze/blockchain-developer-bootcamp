import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import '../App.css';
import config from '../config.json';
import { 
  loadProvider, 
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  loadOrders,
  subscribeToEvents } from '../store/interactions';

import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import OrderBook from './OrderBook';
import PriceChart from './PriceChart';
import Trades from './Trades';
import Transactions from './Transactions';

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
    //const exchangeConfig = config[chainId].exchange;
    const exchange = await loadExchange(provider, config[chainId].exchange.address, dispatch);

    loadOrders(provider, exchange, dispatch);
    subscribeToEvents(exchange, dispatch);
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets/>

          <Balance/>

          <Order/>

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart/>

          <Transactions/>

          <Trades/>

          <OrderBook/>

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
