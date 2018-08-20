let HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
        provider: function() {
            return new HDWalletProvider("daring box glory poem math flip world public silly loan edge nice", "https://rinkeby.infura.io/1gI9DT8OOfMzWzoF21xH")
        },
        network_id: 3
    }
  }
};
