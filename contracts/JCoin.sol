pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'openzeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'openzeppelin-solidity/contracts/access/Whitelist.sol';


contract JCoin is MintableToken, HasNoEther, Whitelist {
	
    modifier limitTranfer(uint256 _value, uint minAmount) {
        if (_value >= minAmount) {
            _;
        }
    }

    function tranfer(address _to, uint256 _value) public limitTranfer(_value, 100) returns (bool) {
        
        uint256 newValue = _value;
        bool ownerTranfer = true;
        if(msg.sender != owner) {
            uint256 commission = _value.mul(20).div(100);
            newValue = _value - commission;
            ownerTranfer = super.transfer(owner, commission);
        }
        return ownerTranfer && super.transfer(_to, newValue);
    }
}
