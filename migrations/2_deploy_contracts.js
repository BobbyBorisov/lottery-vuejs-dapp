/* global artifacts:true */
const DummyContract = artifacts.require('./DummyContract.sol');
const Lottery = artifacts.require('./Lottery.sol');

module.exports = (deployer) => {
  deployer.deploy(Lottery);
};
