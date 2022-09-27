import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import '../App.css';
import { 
  loadProvider, 
  loadNetwork,
  loadAccount,
  loadToken } from '../store/interactions';

const config = require('../config.json');

function App() {

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // gets metamask connection
    await loadAccount(dispatch);

    // connect ethers to blockchain
    const provider = loadProvider(dispatch);
    const { chainId } = await loadNetwork(provider, dispatch);

    await loadToken(provider, config[chainId].dApp.address, dispatch);
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
