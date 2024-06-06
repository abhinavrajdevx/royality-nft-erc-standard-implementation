const Mimemonkey = artifacts.require("Mimemonkey");

contract("Mimemonkey", function (accounts) {
  it("should support the ERC721 and ERC2198 standards", async () => {
    const MimemonkeyInstance = await Mimemonkey.deployed();
    const ERC721InterfaceId = "0x80ac58cd";
    const ERC2981InterfaceId = "0x2a55205a";
    var isERC721 = await MimemonkeyInstance.supportsInterface(ERC721InterfaceId);
    var isER2981 = await MimemonkeyInstance.supportsInterface(ERC2981InterfaceId); 
    assert.equal(isERC721, true, "Mimemonkey is not an ERC721");
    assert.equal(isER2981, true, "Mimemonkey is not an ERC2981");
  });
  it("should return the correct royalty info when specified and burned", async () => {
    const MimemonkeyInstance = await Mimemonkey.deployed();
    await MimemonkeyInstance.mintNFT(accounts[0], "fakeURI");
    // Override royalty for this token to be 10% and paid to a different account
    await MimemonkeyInstance.mintNFTWithRoyalty(accounts[0], "fakeURI", accounts[1], 1000);

    const defaultRoyaltyInfo = await MimemonkeyInstance.royaltyInfo.call(1, 1000);
    var tokenRoyaltyInfo = await MimemonkeyInstance.royaltyInfo.call(2, 1000);
    const owner = await MimemonkeyInstance.owner.call();
    assert.equal(defaultRoyaltyInfo[0], owner, "Default receiver is not the owner");
    // Default royalty percentage taken should be 1%. 
    assert.equal(defaultRoyaltyInfo[1].toNumber(), 10, "Royalty fee is not 10");
    assert.equal(tokenRoyaltyInfo[0], accounts[1], "Royalty receiver is not a different account");
    // Default royalty percentage taken should be 10%.
    assert.equal(tokenRoyaltyInfo[1].toNumber(), 100, "Royalty fee is not 100");

    // Royalty info should be set back to default when NFT is burned
    await MimemonkeyInstance.burnNFT(2);
    tokenRoyaltyInfo = await MimemonkeyInstance.royaltyInfo.call(2, 1000);
    assert.equal(tokenRoyaltyInfo[0], owner, "Royalty receiver has not been set back to default");
    assert.equal(tokenRoyaltyInfo[1].toNumber(), 10, "Royalty has not been set back to default");
  });
});
