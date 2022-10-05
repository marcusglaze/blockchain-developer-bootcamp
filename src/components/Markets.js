import { useDispatch, useSelector } from 'react-redux';

import { loadTokens } from '../store/interactions';

import config from '../config.json';

const Markets = () => {

    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);

    const dispatch = useDispatch();

    const marketHandler = async (e) => {
        await loadTokens(provider, e.target.value.split(','), dispatch)
    }
    
    return(
        <div className='component exchange__markets'>
            <div className='component__header'>
                <h2>Select Market</h2>
            </div>

            {chainId && config[chainId.chainId] && config[chainId.chainId] ? (
                <select name='markets' id='markets' onChange={marketHandler}>
                    <option value={`${config[chainId.chainId].dApp.address},${config[chainId.chainId].mEth.address}`}>dApp/mEth</option>
                    <option value={`${config[chainId.chainId].dApp.address},${config[chainId.chainId].mDai.address}`}>dApp/mDai</option>
                </select>
            ) : (
                <div>
                    <p>Not Deployed to Network</p>
                </div>
            )}
            
            <hr />
        </div>
    )
}

export default Markets;
