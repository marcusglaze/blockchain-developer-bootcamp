// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

    // Exchange contract needs to be able to:
    //      [] deposit
    //      [] withdraw
    //      [] check balances
    //      [] make orders
    //      [] cancel orders
    //      [] fill orders
    //      [] charge fees
    //      [x] track fee account

    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping (address => uint256)) public tokens;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

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
}