const assert = require("assert");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const LandContract = artifacts.require('LandContract')
const Asset = artifacts.require('Asset')

function ether(n) {
    return web3.utils.toWei(n, 'ether');
  }

contract('LandContract', ([owner, user1, user2, user3, investor]) => {
    let asset, landContract
    //console.log("owner address", owner)
    //console.log("user1 address", user1)
    //console.log("user2 address", user2)
    //console.log("user3 address", user3)
    //console.log("investor address", investor)
    //web3.eth.getBalance(owner)
    //.then(console.log)
  
    before(async () => {
      // Load Contracts
      asset = await Asset.new()
      landContract = await LandContract.new(asset.address)
  
      // Transfer all Dapp tokens to farm (1 million)
      //await dappToken.transfer(tokenFarm.address, tokens('1000000'))
  
      // Send tokens to investor
      //await daiToken.transfer(investor, tokens('100'), { from: owner })
    })
  
    describe('LandContract deployment', async () => {
      it('has a name', async () => {
        const name = await landContract.name()
        assert.strictEqual(name, 'Jewel Joy Homeguru', `Name is ${name} instead of Jewel Joy Homeguru`)
      })

      it('should own contract', async () => {
        const owneraddress = await landContract.owner()
        assert.strictEqual(owneraddress, owner, `Owner address is ${owneraddress} instead of ${owner}`)
      })
    })
  
    describe('Asset NFT deployment', async () => {
      it('has a name', async () => {
        const name = await asset.name()
        assert.strictEqual(name, 'Asset', `Name is ${name} instead of Asset`)
      })

      it('should own contract', async () => {
        const owneraddress = await landContract.owner()
        assert.strictEqual(owneraddress, owner, `Owner address is ${owneraddress} instead of ${owner}`)
      })

    })
  
    describe('Testing LandContract AddLand functions', async () => {

      let location = ""
      let image = "QmcQJbw4ZFRMrdK3y4xBX7tKpLT7P416HrDSfyxraq6t8j"
      let landvalue = ether("1.0")
      let landCount

      it('The location should be valid', async () => {

        await expectRevert(landContract.addLand(location, image, landvalue, { from: owner }), "Must be a valid location")

      })

      it('The value should be valid', async () => {

        location = "AMK"
        landvalue = ether("0")
        await expectRevert(landContract.addLand(location, image, landvalue, { from: owner }), "Must be a value")

      })

      it('Should be owner', async () => {

        landvalue = ether("2")
        await expectRevert(landContract.addLand(location, image, landvalue, { from: user1 }), "Should be owner")

        // add first property
        await assert.doesNotReject(async () => await landContract.addLand(location, image, landvalue, { from: owner }))
        landCount = await landContract.landCount()
        await asset.approve(landContract.address, landCount, { from: owner })

      })
    })

    describe('Testing LandContract BuyLand functions', async () => {

        let location = "Bishan"
        let image = "QmUJkwqBtajx8kfRbyjK9Nt8DRPiyoTyPKW3YaAGuKE5Pa"
        let landvalue = ether("1.0")
        let lands
        let landCount
  
        it('should not be owner buying', async () => {

          // add 2nd property
          await landContract.addLand(location, image, landvalue, { from: owner })
          landCount = await landContract.landCount()
          await asset.approve(landContract.address, landCount, { from: owner })

          let id = 1
  
          await expectRevert(landContract.buyLand(id, { from: owner, value: ether("2.0") }), "buyer cannot be land owner")
  
        })
  
        it('The LandID is not valid', async () => {

          id = 3

          await expectRevert(landContract.buyLand(id, { from: user1, value: landvalue }), "land does not exist")
  
        })

        it('Not enough fund to buy', async () => {

            id = 1
    
            await expectRevert(landContract.buyLand(id, { from: user1, value: landvalue }), "Not enough funds")
    
          })
  
        it('Should be able to buy', async () => {

          id = 1
  
          // user1 bought a property
          await assert.doesNotReject(async () => await landContract.buyLand(id, { from: user1, value: ether("2.0") }))
  
        })
      })

      describe('Testing LandContract ListLand functions', async () => {

        let landvalue = ether("1.0")
        let id
  
        it('The land should be valid', async () => {
  
          id = 3
          await expectRevert(landContract.listLand(id, ether("2.0"), { from: user1 }), "land does not exist")
  
        })
  
        it('You should be the land owner', async () => {
  
          id = 1
          await expectRevert(landContract.listLand(id, ether("2.0"), { from: owner }), "you are not the land owner")
  
        })
  
        it('Land already listed', async () => {
  
          id = 1
          landvalue = ether("2")

          // user1 list his or her property
          await assert.doesNotReject(async () => await landContract.listLand(id, landvalue, { from: user1 }))

          await expectRevert(landContract.listLand(id, ether("3.0"), { from: user1 }), "land is already listed")
  
        })
      })
  
  })