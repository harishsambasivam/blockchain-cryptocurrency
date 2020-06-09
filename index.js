const { BlockChain,Transaction } = require('./blockchain.js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('3462041e81f6a10c1c59c2319830db020a9190a9c6bb45e48d1214b12f8a04a1');
const myWalletAddress = myKey.getPublic('hex');

let Porkaasu = new BlockChain();
const tx1  = new Transaction(myWalletAddress,'da4b1affb52946dac987fa8776f6ba658753360d7b8f90388738065f5a4e7dbd50c88a330336f122c18e8d2a6107eb61c9947d8',20);
tx1.signTransaction(myKey);
Porkaasu.addTransaction(tx1);

const tx2  = new Transaction(myWalletAddress,'da4b1affb52946dac987fa8776f6ba658753360d7b8f90388738065f5a4e7dbd50c88a330336f122c18e8d2a6107eb61c9947d8',10);
tx1.signTransaction(myKey);
Porkaasu.addTransaction(tx2);


console.log("\n starting the miner");
Porkaasu.minePendingTransactions(myWalletAddress);

console.log(Porkaasu.getBalanceOfAddress(myWalletAddress));


console.log(Porkaasu.validateChain());
Porkaasu.chain[1].transactions[0].amount = 1;
console.log(Porkaasu.validateChain());
