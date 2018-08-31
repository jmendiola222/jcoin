const { shouldBehaveLikeMintableToken } = require('openzeppelin-solidity/test/token/ERC20/MintableToken.behaviour');
const JCoin = artifacts.require('JCoin');

contract('JCoin', function ([owner, anotherAccount, ...accounts]) {
  const minter = owner;
  let token;

  beforeEach(async function () {
    token = await JCoin.new({ from: owner });
    this.token = token;
  });

  shouldBehaveLikeMintableToken([owner, anotherAccount, minter]);

  const initToTransfer = async ({ token, owner, mintAmount, anotherAccount }) => {
    await token.mint(owner, mintAmount, { from : owner });
    await token.addAddressToWhitelist(anotherAccount, { from: owner });
    const prevBalance = await token.balanceOf(anotherAccount);
    assert.equal(prevBalance, 0);
  }

  describe('when owner tries to tranfer', async function () {
    
    it('less that 100 JCoins, it doesn\'t tranfer', async function () {
      await initToTransfer({token, owner, mintAmount: 1000, anotherAccount});

      await token.tranfer(anotherAccount, 99, { from: owner });
      const newBalance = await token.balanceOf(anotherAccount);
      assert.equal(newBalance, 0);
      const ownerBalance = await token.balanceOf(owner);
      assert.equal(ownerBalance, 1000);
    });

    it('more that 100 JCoins, it tranfers', async function () {
      await initToTransfer({token, owner, mintAmount: 1000, anotherAccount});

      await token.tranfer(anotherAccount, 101, { from: owner });
      const newBalance = await token.balanceOf(anotherAccount);
      assert.equal(newBalance, 101);
      const ownerBalance = await token.balanceOf(owner);
      assert.equal(ownerBalance, 899);

    });
  });

  describe('when holder tries to tranfer', async function () {
    
    const testCommission = async (toTranfer, expectedCommission) => {
      await initToTransfer({token, owner, mintAmount: 1000, anotherAccount});
      await token.tranfer(anotherAccount, 300, { from: owner });
      await token.tranfer(accounts[2], 100, { from: anotherAccount });

      const senderBalance = await token.balanceOf(anotherAccount);
      const ownerBalance = await token.balanceOf(owner);
      const receiverBalance = await token.balanceOf(accounts[2]);
      
      assert.equal(senderBalance, 300 - toTranfer);
      assert.equal(ownerBalance, 700 + toTranfer - expectedCommission);
      assert.equal(receiverBalance, toTranfer - expectedCommission);
    }

    it('100, 20 (20%) goes to owner, 80 to receiver', async function () {
      testCommission(100, 20);
    });

    it('104, 20 (20%) goes to owner, 84 to receiver', async function () {
      testCommission(104, 20);
    });
  });
});
