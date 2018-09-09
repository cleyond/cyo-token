const Token = artifacts.require("CYOToken");
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('CYOTokenTests', function([creator, investor, wallet, purchaser, otherPerson]) {

    const rate = new BigNumber(1);

    beforeEach(async function () {
        this.token = await Token.new();
      });

    it('should deploy the token and get its address and symbol', function(done) {
        Token.deployed().then(async function(instance) {
            assert(instance, 'Token address couldn\'t be stored');

            const symbol = await instance.symbol();
            assert(symbol === 'CYO', 'Wrong Symbol detected');

            done();
       });
    });    

    it('should have an initial balance of zero', async function() {
        const totalSupply = await this.token.totalSupply();
        totalSupply.should.be.bignumber.eq(0);
    });    

})