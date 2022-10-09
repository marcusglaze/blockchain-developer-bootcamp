// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

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
    mapping(uint256 => bool) public orderFilled;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    //event Order(_Order order);
    //event Cancel(_Order order);
    //event Trade(address creator, _Order order);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp);
    
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp);

    event Trade(
        address creator,
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent; 
    }

    function depositToken(address _token, uint256 _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[msg.sender][_token] = tokens[msg.sender][_token] + _amount;
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
        //emit Order(order);
        emit Order(ordersCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order memory order = orders[_id];
        require(order.id == _id);
        require(order.user == msg.sender);
        orderCancelled[order.id] = true;
        //emit Cancel(order);
        emit Cancel(order.id, order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, order.timestamp);
    }

    function fillOrder(uint256 _id) public {
        require(orders[_id].id == _id);
        require(orderFilled[_id] != true);
        require(orderCancelled[_id] != true);
        
        _Order memory order = orders[_id];
        _trade(order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive);
        orderFilled[_id] = true;

        //emit Trade(msg.sender, order);
        emit Trade(msg.sender, order.id, order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, order.timestamp);
    }

    function _trade(address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
        uint256 _feeAmount = _amountGet * feePercent / 100;
        require(tokens[msg.sender][_tokenGet] >= (_amountGet + _feeAmount));

        tokens[_user][_tokenGet] = tokens[_user][_tokenGet] + _amountGet;
        tokens[msg.sender][_tokenGet] = tokens[msg.sender][_tokenGet] - (_amountGet + _feeAmount);
        tokens[feeAccount][_tokenGet] = tokens[feeAccount][_tokenGet] + _feeAmount;

        tokens[_user][_tokenGive] = tokens[_user][_tokenGive] - _amountGive;
        tokens[msg.sender][_tokenGive] = tokens[msg.sender][_tokenGive] + _amountGive;
    }
}
