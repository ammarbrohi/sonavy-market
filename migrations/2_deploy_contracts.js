var OnlineMarketplace = artifacts.require("./OnlineMarketplace.sol");

module.exports = function(deployer) {
    deployer.deploy(OnlineMarketplace);
};
