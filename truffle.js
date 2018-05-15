var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "squeeze become vocal neither fatal cactus once cabbage general lunar such match";

const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/6fd457a3bf934f8696b2590a5d1dfdbd")
      },
      network_id: 3
    }  
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },

  contracts_build_directory: path.join(__dirname, "client/src/contracts")
};
