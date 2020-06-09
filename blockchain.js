const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
   constructor(sender,receiver,amount){
     this.sender = sender;
     this.receiver = receiver;
     this.amount = amount;
   }

   calculateHash(){
     return SHA256(this.sender+this.receiver+this.amount).toString();
   }

   signTransaction(signingKey){
     if(signingKey.getPublic('hex') != this.sender ){
       console.err("You can't sign transactions for other wallets");
     }

     const hashTx = this.calculateHash();
     const signature = signingKey.sign(hashTx,"base64");
     this.signature = signature.toDER('hex');
   }

   isValid(){
     if(this.sender === null ) return true;

     if(!this.signature || this.signature.length === 0){
          console.err("No signature in this transaction");
     }

     const publicKey = ec.keyFromPublic(this.sender,'hex');
     return publicKey.verify(this.calculateHash,this.signature);
   }
}

class Block{
  constructor(transactions,timestamp,prevhash=""){
        this.transactions = transactions;
        this.timestamp = timestamp;
        this.prevHash = prevhash;
        this.hash = this.calculateHash();
        this.nonce = 0;
  }

  calculateHash(){
    return SHA256(this.index+JSON.stringify(this.transactions)+this.timestamp+this.nonce).toString();
  }

  mineBlock(difficulty){
    while(this.hash.substring(0,difficulty) !==  Array(difficulty + 1).join("0")){
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Hash Mined:"+this.hash);
  }

  verifyTransactions(){
    for(let transaction of this.transactions){
        if(!transaction.isValid){
          return false;
        }
    }
    return true;
  }
}

class BlockChain{
    constructor(){
       this.chain = [this.createGenesisBlock()];
       this.difficulty = 2;
       this.pendingTransactions  = [];
       this.rewardAmount = 100;
    }

    createGenesisBlock(){
      return new Block(["starting point"],new Date(),null);
    }

    addTransaction(transaction){
        if(!transaction.sender || !transaction.receiver){
          console.err("Transaction must include both sender and receiver address");
        }

        if(!transaction.isValid){
          console.err("Transaction must be valid to add into chain");
        }

        return this.pendingTransactions.push(transaction);
    }

    getLastBlock(){
      let length = this.chain.length;
      return this.chain[length - 1];
    }

    minePendingTransactions(address){
        let rewardTx = new Transaction(null,address,this.rewardAmount);
        this.pendingTransactions.push(rewardTx);
        let block = new Block(this.pendingTransactions,new Date(),this.getLastBlock().hash);
        block.mineBlock(this.difficulty);
        console.log("\n Block Mined Successfully");
        this.chain.push(block);
        this.pendingTransactions= []
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(let block of this.chain){
          for(let trans of block.transactions){
            if(trans.sender === address){
                  balance -= trans.amount;
            }
            if(trans.receiver === address){
                  balance += trans.amount;
            }
          }
        }
      return balance;
    }

    validateChain(){
      for(let i = 1; i < this.chain.length; i++){
        this.currentBlock = this.chain[i];
        this.prevBlockHash = this.chain[i-1].hash;

        if(!this.currentBlock.verifyTransactions){
          return false;
        }

        if(this.currentBlock.hash !== this.currentBlock.calculateHash()){
          return false;
        }

        if(this.prevBlockHash !== this.currentBlock.prevHash){
          return false;
        }

      }
      return true;
    }
}


module.exports = {
    BlockChain,
    Transaction
}
