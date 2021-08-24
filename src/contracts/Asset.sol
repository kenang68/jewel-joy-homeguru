// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Asset is ERC721 {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  string[] public asset;
  mapping(string => bool) _contractExists;

  constructor() ERC721("Asset", "ASSET") {
  }

  function awardItem(address player)
      public
      returns (uint256)
  {
      _tokenIds.increment();

      uint256 newItemId = _tokenIds.current();
      _mint(player, newItemId);
      //_tokenIds.increment();

      return newItemId;
  }

  function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
    _setTokenURI(tokenId, _tokenURI);
  }

  //tokenURI function obtains the url

}