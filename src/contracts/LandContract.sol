// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.7.6;

import "./Asset.sol";


contract LandContract {

  string public name;
  address public owner;
  uint public landCount = 0;
  Asset public a;
  
  mapping(uint => Land) public lands;

  struct Land {
    uint landID;
    string location;
    string image;
    uint value;
    address payable owner;
    bool forSale;
  }

  constructor(Asset addr) {
    name = "Jewel Joy Homeguru";
    owner = msg.sender;
    a = addr;
  }
  
  
  event Add(
    uint landID, 
    string location, 
    uint value, 
    address payable owner, 
    bool forSale
  );

  event Transfer(
    uint landID, 
    string location, 
    uint value, 
    address payable owner, 
    bool forSale
  );

  event List(
    uint landID, 
    string location, 
    uint value, 
    address payable owner, 
    bool forSale
  );
    
  modifier isOwner {
    require(msg.sender == owner, 'Should be owner');
    _;
  } 

  function addLand(string memory _location, string memory _image, uint _value) public isOwner {
    // Require a valid location
    require(bytes(_location).length > 0, 'Must be a valid location');
    // Requie a valid value
    require(_value > 0, 'Must be a value');
    // Increment land count
    landCount++;
    // Add land
    lands[landCount] = Land(landCount, _location, _image, _value, msg.sender, true);
    a.awardItem(address(this));
    a.safeTransferFrom(address(this), owner, landCount);

    // Trigger an event
    emit Add(landCount, _location, _value, msg.sender, true);
  }

  function buyLand(uint _id) public payable {
    // Fetch the land
    Land memory _land = lands[_id];
    // Fetch the owner
    address payable _landHolder = _land.owner;
    // Make sure the Land is valid
    require(_land.landID > 0 && _land.landID <= landCount, 'land does not exist');
    // Require that there is enough Ether in the transaction
    require(msg.value >= _land.value, 'Not enough funds');
    // Require land is for sale
    require(_land.forSale == true, 'land is not for sale');
    // Require buyer is not landHolder
    require(_landHolder != msg.sender, 'buyer cannot be land owner');
    // Transfer ownership to buyer
    _land.owner = msg.sender;
    // Mark as purchased
    _land.forSale = false;
    // Update land
    lands[_id] = _land;
    // Pay landHolder
    payable(address(_landHolder)).transfer(msg.value);
    a.safeTransferFrom(_landHolder, msg.sender, _land.landID);
    // Trigger an event
    emit Transfer(_id, _land.location, _land.value, msg.sender, false);
  }
  
  function listLand(uint _id, uint _value) public payable {
    // Fetch the land
    Land memory _land = lands[_id];
    // Make sure the Land is valid
    require(_land.landID > 0 && _land.landID <= landCount, 'land does not exist');
    // Require that there is enough Ether in the transaction
    require(_land.owner == msg.sender, 'you are not the land owner');
    // Require land is not listed
    require(_land.forSale == false, 'land is already listed');
    // Mark as listed
    _land.forSale = true;
    // Update price
    _land.value = _value;
    // Update land
    lands[_id] = _land;
    // Trigger an event
    emit List(_id, _land.location, _value, msg.sender, true);
  }

}