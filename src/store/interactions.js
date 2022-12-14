import { ethers } from "ethers";

const TOKEN_ABI = require('../abis/Token.json').abi;
const EXCHANGE_ABI = require('../abis/Exchange.json').abi;

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type: 'PROVIDER_LOADED', connection});
    return connection;
}

export const loadNetwork = async (provider, dispatch) => {
    const chainId = await provider.getNetwork();
    dispatch({type: 'NETWORK_LOADED', chainId});
    return chainId;
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({type: 'ACCOUNT_LOADED', account})
    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    dispatch({type: 'ETHER_BALANCE_LOADED', balance});
    return account;
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol;

    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({type: 'TOKEN_1_LOADED', token, symbol});

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({type: 'TOKEN_2_LOADED', token, symbol});

    return token;
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({type: 'EXCHANGE_LOADED', exchange});
    return exchange;
}

export const subscribeToEvents = (exchange, dispatch) => {
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        dispatch({type: 'TRANSFER_SUCCESS', event});
    })
    exchange.on('Withdraw', (token, user, amount, balance, event) => {
        dispatch({type: 'TRANSFER_SUCCESS', event});
    })
    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args;
        dispatch({type: 'NEW_ORDER_SUCCESS', order, event});
    })
    exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args;
        dispatch({type: 'CANCEL_ORDER_SUCCESS', order, event});
    })
    exchange.on('Trade', (creator, id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args;
        dispatch({type: 'FILL_ORDER_SUCCESS', order, event}); 
    })
}

export const loadBalances = async (exchange, tokens, account, dispatch) => {
    let balance;
    
    balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18);
    dispatch({type: 'TOKEN_1_BALANCE_LOADED', balance});
    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
    dispatch({type: 'TOKEN_2_BALANCE_LOADED', balance});

    balance = ethers.utils.formatUnits(await exchange.tokens(account, tokens[0].address), 18);
    dispatch({type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance});
    balance = ethers.utils.formatUnits(await exchange.tokens(account, tokens[1].address), 18);
    dispatch({type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance});
}

export const loadOrders = async (provider, exchange, dispatch) => {
    const block = await provider.getBlockNumber();

    // Fetch all orders
    const orderStream = await exchange.queryFilter('Order', 0, block);
    const allOrders = orderStream.map(event => event.args);
    dispatch({type: 'ALL_ORDERS_LOADED', allOrders})

    // Fetch cancelled orders
    const cancelStream = await exchange.queryFilter('Cancel', 0, block);
    const cancelledOrders = cancelStream.map(event => event.args);
    dispatch({type: 'CANCELLED_ORDERS_LOADED', cancelledOrders});

    // Fetch filled orders
    const tradeStream = await exchange.queryFilter('Trade', 0, block);
    const filledOrders = tradeStream.map(event => event.args);
    dispatch({type: 'FILLED_ORDERS_LOADED', filledOrders});
}

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
    let transaction;

    dispatch({type: 'TRANSFER_REQUEST'});

    try {
        const signer = await provider.getSigner();
        const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

        if (transferType === 'Deposit') {
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer);
            await transaction.wait();
            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer);
            await transaction.wait(); 
        } else {
            transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer);
            await transaction.wait();
        }
        
    } catch(error) {
        dispatch({type: 'TRANSFER_FAIL'});
    }
}

export const makeOrder = async (provider, exchange, orderType, tokens, amount, price, dispatch) => {
    let transaction;

    dispatch({type: 'NEW_ORDER_REQUEST'});

    try {
        const signer = provider.getSigner();

        if (orderType === 'Buy') {
            const getAmount = ethers.utils.parseUnits(amount.toString(), 18);
            const giveAmount = ethers.utils.parseUnits((price * amount).toString(), 18);
            transaction = await exchange.connect(signer).makeOrder(tokens[0].address, getAmount, tokens[1].address, giveAmount);
            await transaction.wait();
        } else {
            const getAmount = ethers.utils.parseUnits((price * amount).toString(), 18);
            const giveAmount = ethers.utils.parseUnits(amount.toString(), 18);
            transaction = await exchange.connect(signer).makeOrder(tokens[1].address, getAmount, tokens[0].address, giveAmount);
            await transaction.wait();
        }

    } catch(error) {
        dispatch({type: 'NEW_ORDER_FAIL'});
    }
}

export const cancelOrder = async (provider, exchange, order, dispatch) => {
    dispatch({type: 'CANCEL_ORDER_REQUEST'});

    try {
        const signer = provider.getSigner();
        const transaction = await exchange.connect(signer).cancelOrder(order.id)
        await transaction.wait();
    } catch(error) {
        dispatch({type: 'CANCEL_ORDER_FAIL'});
    }
}

export const fillOrder = async (provider, exchange, order, dispatch) => {
    dispatch({type: 'FILL_ORDER_REQUEST'});
    try {
        const signer = provider.getSigner();
        const transaction = await exchange.connect(signer).fillOrder(order.id)
        await transaction.wait();
    } catch(error) {
        dispatch({type: 'FILL_ORDER_FAIL'});
    }
}