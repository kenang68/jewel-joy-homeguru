const LandContract = artifacts.require("LandContract");
const Asset = artifacts.require("Asset");

module.exports = function(deployer,network) {
  deployer.deploy(Asset).then(() => {
    return deployer.deploy(LandContract, Asset.address);
  });
};