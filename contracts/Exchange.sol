// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Exchange {

    // Exchange contract needs to be able to:
    //      [] deposit
    //      [] withdraw
    //      [] check balances
    //      [] make orders
    //      [] cancel orders
    //      [] fill orders
    //      [] charge fees
    //      [] track fee account

    address public feeAccount;
    uint256 public feePercent;

    mapping(address => uint256) public balanceOf;

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent; 
    }
}