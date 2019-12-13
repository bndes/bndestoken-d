var Notary = artifacts.require("./Notary.sol");

module.exports = async (deployer) => {
	await deployer.deploy(Notary)    
	NotaryInstance = await Notary.deployed();	
};
