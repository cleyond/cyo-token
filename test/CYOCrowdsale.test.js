
const assertRevert = require('openzeppelin-solidity/test/helpers/assertRevert');
const { advanceBlock } = require ('openzeppelin-solidity/test/helpers/advanceToBlock');
const { ether } = require('openzeppelin-solidity/test/helpers/ether');
const { expectThrow } = require('openzeppelin-solidity/test/helpers/expectThrow');
const { EVMRevert } = require ('openzeppelin-solidity/test/helpers/EVMRevert');
const { ethGetBalance } = require('openzeppelin-solidity/test/helpers/web3');

const truffleAssert = require('truffle-assertions');


var Crowdsale = artifacts.require("CYOCrowdsale");
var Token = artifacts.require("CYOToken");

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function printEther(label, wei) {
    console.log(label + ': ' + wei2Ether(wei));
}

function wei2Ether(wei) {
    return web3.fromWei(wei, 'ether').toFixed();
}

function balance(address) {
    return web3.eth.getBalance(address);
}

contract('CrowdsaleTests', function([creator, investor, wallet, purchaser, otherPerson]) {

    const rate = new BigNumber(1);

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });

    beforeEach(async function () {
        this.token = await Token.new();
        this.crowdsale = await Crowdsale.new(rate, wallet, this.token.address, ether(4));
        
        await this.token.transferOwnership(this.crowdsale.address);
    });

    it('should deploy the crowdsale with the right token', function(done) {
        Crowdsale.deployed().then(async function(instance) {
            const token = await instance.token.call();
            assert(token, 'Token address couldn\'t be stored');

            assert(token == Token.address, 'Invalid token address');

            done();
        });
    });    


    describe('Ownership related tests', function () {
        it('test changing ownership from attacker', async function() {
            (await this.crowdsale.owner()).should.equal(creator);  
            await expectThrow(this.crowdsale.transferOwnership(investor, { from: otherPerson }), EVMRevert);
        })
  
        it('test changing ownership regularly', async function () {
            (await this.crowdsale.owner()).should.equal(creator);  
           
            // change ownership
            await this.crowdsale.transferOwnership(otherPerson);
            (await this.crowdsale.owner()).should.equal(otherPerson);  

            // $otherPerson gives us back the control
            await this.crowdsale.transferOwnership(creator, {from: otherPerson});

            (await this.crowdsale.owner()).should.equal(creator);  
        })
        
    })

    describe('Wallet related tests', function () {
        it('test changing wallet from attacker', async function() {
            await expectThrow(this.crowdsale.setWallet(otherPerson, {from: otherPerson}), EVMRevert);  
        })
        it('test changing wallet legally', async function() {
            await this.crowdsale.setWallet(otherPerson);  
            (await this.crowdsale.wallet()).should.be.equal(otherPerson);
        })
    })
    
    describe('using MintableToken', function () {
        it('should be token owner', async function () {
          const owner = await this.token.owner();
          owner.should.equal(this.crowdsale.address);
        });
    
        describe('accepting payments', function () {

            it('will accept payments', async function () {
                // remember current wallet balance
                const walletBallance = balance(wallet);
            
                await this.crowdsale.send( ether(.001) );

                // expect value more ether on the wallet
                balance(wallet).should.be.bignumber.equal( new BigNumber(walletBallance).add( ether(.001) )  );
            });

            it('can buy minted tokens', async function () {

              const value = ether(.001);

              // current supply is 0
              (await this.token.totalSupply()).should.be.bignumber.equal(0);  

              // safe current wallet balance
              const walletBallance = balance(wallet);
              console.log("WB", wei2Ether(walletBallance))

              printEther('Investor', balance(investor))

              // we send ether
              await this.crowdsale.send(value);

              const purchaserBallanceBefore = balance(purchaser);

              printEther('1 Purchaser', balance(purchaser));

              // we buy tokens from purchaser
              await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });

              const purchaserBallanceAfter = balance(purchaser);

              // it should have cost the purchaser at least the value to spent and also some unknown gas
              purchaserBallanceBefore.minus(purchaserBallanceAfter).should.be.bignumber.at.least(value);


              console.log( wei2Ether( await this.token.balanceOf(purchaser)) );
              console.log( wei2Ether( await this.token.balanceOf(investor)) );

              // purchaser bought for investor
              (await this.token.balanceOf(purchaser)).should.be.bignumber.equal(0);
              (await this.token.balanceOf(investor)).should.be.bignumber.equal(value);

              /*console.log("A", wei2Ether( purchaserBallanceBefore) )
              console.log("B", wei2Ether( purchaserBallanceAfter) )
              console.log("=", wei2Ether( purchaserBallanceBefore.minus(purchaserBallanceAfter)) )

              console.log("Balances:")
              console.log("=========")
              printEther('Creator', balance(creator))
              printEther('Investor', balance(investor))
              printEther('Wallet', balance(wallet))
              printEther('2 Purchaser', balance(purchaser))
              printEther('Crowdsale', balance(this.crowdsale.address))
              printEther('Token', balance(this.token.address))
        
              printEther('Token Supply', await this.token.totalSupply());*/
              
        
              // current supply is 0.002
              (await this.token.totalSupply()).should.be.bignumber.equal( ether(.002) );  

              // expect 0.002 more ether on the wallet
              balance(wallet).should.be.bignumber.equal( new BigNumber(walletBallance).add( ether(.002) )  );


            });
          });
      
      });
    
})