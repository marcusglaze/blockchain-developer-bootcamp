// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals = 18; // ERC-20 Standard
    uint256 public totalSupply;

    mapping (address => uint256) public balanceOf;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    
    constructor (string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        uint256 fromBalance = balanceOf[msg.sender];
        uint256 toBalance = balanceOf[_to];

        // check to make sure owner has enough for transfer
        assert(fromBalance >= _value);

        balanceOf[msg.sender] = fromBalance - _value;
        balanceOf[_to] = toBalance + _value;

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

    }

    function approve(address _spender, uint256 _value) public returns (bool success) {

    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {

    }

}
