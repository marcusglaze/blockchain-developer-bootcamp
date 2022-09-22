// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

    // Exchange contract needs to be able to:
    //      [x] deposit
    //      [x] withdraw
    //      [x] check balances
    //      [x] make orders
    //      [x] cancel orders
    //      [] fill orders
    //      [] charge fees
    //      [x] track fee account

    address public feeAccount;
    uint256 public feePercent;
    uint256 public ordersCount;

    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;   
    }

    mapping(address => mapping (address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancelled;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(_Order order);
    event Cancel(_Order order);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent; 
    }

    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        // Update user balance
        tokens[msg.sender][_token] = tokens[msg.sender][_token] + _amount;
        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[msg.sender][_token]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(tokens[msg.sender][_token] >= _amount);
        Token(_token).transfer(msg.sender, _amount);
        tokens[msg.sender][_token] = tokens[msg.sender][_token] - _amount;
        emit Withdraw(_token, msg.sender, _amount, tokens[msg.sender][_token]);
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        require(tokens[msg.sender][_tokenGive] >= _amountGive);
        ordersCount++;
        _Order memory order = _Order(ordersCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        orders[ordersCount] = order;
        emit Order(order);
    }

    function cancelOrder(uint256 _id) public {
        _Order memory order = orders[_id];
        require(order.id == _id);
        require(order.user == msg.sender);
        orderCancelled[order.id] = true;
        emit Cancel(order);
    }
}
