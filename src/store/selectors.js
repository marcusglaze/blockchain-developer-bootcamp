import { createSelector } from "reselect";
import { get, groupBy, reject } from "lodash";
import { ethers } from "ethers";
import moment from "moment/moment";

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts');
const allOrders = state => get(state, 'exchange.allOrders.data', []);
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = state => get(state, 'exchange.filledOrders.data', []);

const openOrders = state => {
    const all = allOrders(state);
    const cancelled = cancelledOrders(state);
    const filled = filledOrders(state);

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.order.id.toString() === order.order.id.toString());
        const orderCancelled = cancelled.some((o) => o.order.id.toString() === order.order.id.toString());
        return (orderFilled || orderCancelled)
    })

    return openOrders;
}

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount;

    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive;
        token1Amount = order.amountGet;
    } else {
        token0Amount = order.amountGet;
        token1Amount = order.amountGive;
    }

    // calculate token price to 5 decimal places
    const precision = 100000;
    let tokenPrice = (token1Amount / token0Amount);
    tokenPrice = Math.round(tokenPrice * precision) / precision;

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
        token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MM D')
    })
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';
    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}

const decorateOrderBooksOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order.order, tokens);
            order = decorateOrderBookOrder(order, tokens);
            return(order);
        })
    )
}

export const orderBookSelector = createSelector(
    openOrders, 
    tokens, 
    (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {return};
    
    // filter orders by selected tokens
    orders = orders.filter((o) => o.order.tokenGet === tokens[0].address || o.order.tokenGet === tokens[1].address);
    orders = orders.filter((o) => o.order.tokenGive === tokens[0].address || o.order.tokenGive === tokens[1].address);

    // decorate orders
    orders = decorateOrderBooksOrders(orders, tokens);

    // group by order type
    orders = groupBy(orders, 'orderType');

    // sort buy orders by token price
    const buyOrders = get(orders, 'buy', []);
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }
    // sort sell orders by token price
    const sellOrders = get(orders, 'sell', []);
    orders = {
        ...orders,
        sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    return orders;
})
