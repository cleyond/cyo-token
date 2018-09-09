pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract CYOToken is MintableToken {
  string public name = "CYO Token";
  string public symbol = "CYO";
  uint8 public decimals = 18;
}


