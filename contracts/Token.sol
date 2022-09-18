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
        // check to make sure owner has enough for transfer
        require(balanceOf[msg.sender] >= _value);

        // check to make sure _to address is valid
        require(_to != address(0));

        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

    }

    function approve(address _spender, uint256 _value) public returns (bool success) {

    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {

    }

}
