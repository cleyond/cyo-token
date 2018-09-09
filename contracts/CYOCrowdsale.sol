pragma solidity ^0.4.22;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./CYOToken.sol";


contract CYOCrowdsale is Ownable, Crowdsale, MintedCrowdsale, CappedCrowdsale {

    event WalletChange(address wallet);

    /**
    * @param _rate Number of token units a buyer gets per wei
    * @param _wallet Address where collected funds will be forwarded to
    * @param _token Address of the token being sold
    * @param _cap Hard Cap
    */
    constructor(uint256 _rate, address _wallet, ERC20 _token, uint256 _cap) 
        Ownable()
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
    public {
    }

    function setWallet(address _wallet) onlyOwner public {
        require(_wallet != 0x0);
        wallet = _wallet;
        
        WalletChange(_wallet);
    }

}