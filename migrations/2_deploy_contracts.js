var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var OnlineMarketplace = artifacts.require("./OnlineMarketplace.sol");

module.exports = function(deployer) {
    deployer.deploy(SimpleStorage);
    deployer.deploy(OnlineMarketplace);
};
