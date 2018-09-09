var CYOToken = artifacts.require("CYOToken");
var CYOCrowdsale = artifacts.require("CYOCrowdsale");

module.exports = function(deployer, network, accounts) {
  const openingTime = web3.eth.getBlock('latest').timestamp + 2; // two secs in the future
  const closingTime = openingTime + 86400 * 20; // 20 days
  const rate = new web3.BigNumber(1000);

  const wallet = accounts[1];

  const hardCap = 25000000;

  return deployer
      .then(() => {
          return deployer.deploy(CYOToken);
      })
      .then(() => {
          return deployer.deploy(
            CYOCrowdsale,
              rate,
              wallet,
              CYOToken.address,
              hardCap
          );
      });
};