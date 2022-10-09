import { useRef, useState } from "react";
import { useSelector } from "react-redux";

import { myOpenOrdersSelector, myFilledOrdersSelector } from "../store/selectors";

import Banner from "./Banner";

import sort from '../assets/sort.svg';

const Transactions = () => {

    const symbols = useSelector(state => state.tokens.symbols);

    const openOrders = useSelector(myOpenOrdersSelector);
    const filledOrders = useSelector(myFilledOrdersSelector);

    const [showOrders, setShowOrders] = useState(true);

    const ordersRef = useRef(null);
    const tradesRef = useRef(null);

    const tabHandler = (e) => {
      if (e.target.className !== ordersRef.current.className) {
        e.target.className = 'tab tab--active';
        ordersRef.current.className = 'tab';
        setShowOrders(false);
      } else {
        e.target.className = 'tab tab--active';
        tradesRef.current.className = 'tab';
        setShowOrders(true);
      }
    }

    return (
      <div className="component exchange__transactions">
        {showOrders ? (
          <div>
            <div className='component__header flex-between'>
              <h2>My Orders</h2>
    
              <div className='tabs'>
                <button onClick={tabHandler} ref={ordersRef} className='tab tab--active'>Orders</button>
                <button onClick={tabHandler} ref={tradesRef} className='tab'>Trades</button>
              </div>
            </div>

            {!openOrders || openOrders.length === 0 ? (
              <Banner text='No Open Orders'/>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>{symbols && symbols[0]}<img src={sort} alt='Sort'/></th>
                    <th>{symbols && `${symbols[0]}/${symbols[1]}`}<img src={sort} alt='Sort'/></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {openOrders && openOrders.map((order,index) => {
                    return (
                      <tr key={index}>
                        <td style={{color: order.orderTypeClass}}>{order.token0Amount}</td>
                        <td>{order.tokenPrice}</td>
                        <td>Button</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div>
            <div className='component__header flex-between'>
              <h2>My Transactions</h2>
    
              <div className='tabs'>
                <button onClick={tabHandler} ref={ordersRef} className='tab tab--active'>Orders</button>
                <button onClick={tabHandler} ref={tradesRef} className='tab'>Trades</button>
              </div>
            </div>

            {!filledOrders || filledOrders.length === 0 ? (
              <Banner text='No Transactions'/>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Time<img src={sort} alt='Sort'/></th>
                    <th>{symbols && symbols[0]}<img src={sort} alt='Sort'/></th>
                    <th>{symbols && `${symbols[0]}/${symbols[1]}`}<img src={sort} alt='Sort'/></th>
                  </tr>
                </thead>
                <tbody>
                  {filledOrders && filledOrders.map((order, index) => {
                    return (
                      <tr key={index}>
                        <td>{order.formattedTimestamp}</td>
                        <td style={{color: order.orderTypeClass}}>{order.orderSign}{order.token0Amount}</td>
                        <td>{order.tokenPrice}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        </div>
    )
  }
  
  export default Transactions;
