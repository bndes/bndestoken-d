pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "../appChangeManagementUpgrade/Updatable.sol";

import "./LegalEntityMapping.sol";

contract BNDESRegistry is Updatable {


    LegalEntityMapping public legalEntityMapping;

//    event AccountRegistration(address addr, uint cnpj, uint idFinancialSupportAgreement, string idProofHash);
//   event AccountChange(address oldAddr, address newAddr, uint cnpj, uint64 idFinancialSupportAgreement, string idProofHash);
 
    constructor (address upgraderInfo, address legalEntityMappingAddr) Updatable (upgraderInfo) public {
        legalEntityMapping = LegalEntityMapping(legalEntityMappingAddr);
    }

    function setLegalEntityMapping (address newAddr) public onlyAllowedUpgrader {
        legalEntityMapping = LegalEntityMapping(newAddr);
    }

    function registryLegalEntity(uint64 id) public {
        legalEntityMapping.setId(msg.sender, id);
    }

////TESTE************************
    function registryLegalEntity2TESTE() public {
        legalEntityMapping.setId(address(0xff1465539F3F22Df5bc197312AB28B04E3815624), 123456);
    }
    function registryLegalEntity2TESTE2() public {
        legalEntityMapping.setHANDTESTE();
    }
    function registryLegalEntity2TESTE4() public {
        legalEntityMapping.setTESTE();
    }
    function getId(address addr) external view returns (uint) {
        return legalEntityMapping.getId(addr);
    }


    function kill() external onlyAllowedUpgrader {
        selfdestruct(address(0));
    }

/*
//TEST
    function isAvailable(address addr) public view returns (bool) {
        return legalEntityMapping.isAvailable(addr);
    }
*/

}