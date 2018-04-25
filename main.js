const SHA256 = require("crypto-js/sha256");      // "npm install --save crypto-js"  .. javascript does not have SHA256 by default so we import 'crypto-js' so we can use its sha256 hash function


class Block {                                                     // the blockchain is made up of individual records that are called Blocks. Each block contains a timestamp, transaction data and a hash pointer as a link to a previous block on the chain, the blocks are made up of batches of valid transactions and are constructed by a miner node that is used to verify a transaction and then they are added to the blockchain by placing the transactions data into this Block object and encoding the Blocks into a hash tree structure that is the blockchain where the block's hash pointer's will point to previous blocks all the way back to the "genesis" block (first block in chain). Sometimes blocks are produced concurrently, creating a temporary fork in the chain. A "hard fork" is where the blockchain is turned into two separate blockchains (could be for any number of reasons such as corporate). The hash encodings connecting the blocks on the chain cause the blockchain to be secure since it is on a peer-to-peer network where all nodes are trusted equally and any change to one block would not be possible unless a major change was made to the entire blockchain. Blocks not selected for inclusion in the chain are called "orphan blocks".
    constructor(index, timestamp, data, previousHash = '') {        // the index (optional) tells us where the Block sits on the chain, timestamp tells us when block was created, the data will include any type of data that is associated with the block such as the details of a transaction (if the blockchain is for a cryptocurrency) such as how much money transferred and who was sender and receiver, and previousHash is the String that contains the hash of the block before this one, which ensures the integrity of our blockchain, and it is initialized as a blank String by default since a Block will not be given a previousHash until it is ready to be added to the Blockchain with addBlock(), and only the genesis block will have a blank previousHash in the Blockchain
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;                            // we are keeping track of all the block's properties inputted upon initialization into the constructor and making them instance variables so they can be referenced in our methods such as 'calculateHash()'
        this.previousHash = previousHash;            // the previousHash is blank until the Block object is ready to be added to the blockchain, in which case, once the 'previousHash' is set and the Block is added to the chain, the current Block's hash will have to be recalculated since the 'previousHash' property has changed, which is a part of the hash function we have. Also it is important that all the final hashes of the Blocks include the correct 'previousHash' since this is how the Blockchain keeps its integrity cryptography-wise since all the Blocks are connected in this encoded way

        this.hash = this.calculateHash();            // will contain the hash of our block that we calculate here (compared to the previousHash which is inputted into our constructor upon initialization from our last Block's "hash" property). the calculateHash() function returns the hash for our Block which will keep our Block secure on the blockchain

        this.nonce = 0;
    }

    calculateHash() {                          // calculates the hash value of our block by taking the properties inputted into the Block and runs it through a hash function and returns the hash for our block that will represent it in the blockchain, which another Block will have it as it's "previousHash"
        return SHA256(                         // concatenates all the block's properties together (converting the data into a String) and runs the combined String through a hash function to create a hash object that we convert to a String with 'toString()' and this hash String will represent the current block.. The blocks in the blockchain have integrity because the hashes are linked to one another and cannot be changed since the 'previousHash' is used in the hashing function to create the current block's hash, so this keeps all the hashes linked to one another cryptography-wise
            this.index +
            this.timestamp + 
            JSON.stringify(this.data) +
            this.previousHash +
            this.nonce                      // nonce is also added to our hash function so that when the Block is mined, it changes our hash calculation every time the hash is recalculated with an incremented nonce value (nonce++)
        ).toString();
    }

    mineBlock(difficulty) {                  // this method will continuously recalculate the hash for our block to add a 0 in front of our hash for every recalculation, and it continues until the 'difficulty' number is met meaning how many 0s should be in front of our hash and every time the while loop recalculates the hash our (non-related) 'nonce' variable is incremented so that it changes the hashing function every time (the nonce it added to our hash function with our other properties)

        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {       // creates a continuous while loop that will keep recalculating a hash until there are enough 0s in front of the hash that equal the 'difficulty' number and once the hash has its needed 0s in front of the hash, then the Block has been successfully mined. The recalculated hash will keep generating hashes with the nonce variable being incremented in the hashing function every time and the it will keep calculating the hash until one of the times one of the hashes finally has the goal number of 0s in front of it. The 0s are not calculated one at a time or anything. It is waiting for a hash that miraculously has the right number in front. This is why when the difficulty increases it becomes exponentially harder since the probability of getting a larger number of 0s becomes slimmer and slimmer for every new 0 added to the difficulty... The conditional in the while loop states that the loop will continue until the hash (this.hash) has a substring of the beginning characters that are all 0s (ex substring(0, 4) will be indices 0, 1, 2, 3 as '0') and the substring array [0, 0, 0, 0] must be equal to an Array object created with (4 + 1) cells with a '0' character joining each cell so thus there are four 0s in a 5 cell array with 4 links between the 5 cells and a 0 joining each link
            this.nonce++;                                                               // the nonce is an unrelated random number that doesn't have anything to do with the Block but we add it as a value concatenated onto our hashing function so that it changes the hash every time it is recalculated in the mining process since the while loop increments the 'nonce' every loop so the calculated hash changes
            this.hash = this.calculateHash();                                           // the calculated hash will now change to a different value every loop and the loop will continue until the goal is met with the right number of 0s in front of the hash
        }

        console.log("Block mined: " + this.hash);
    }
}


class Blockchain {                                  // will be a collection of Blocks in a hash tree structure with the actual chain structure being constructed of an array that holds the Block objects
    constructor() {                                 // the Blockchain is initialized with the 'chain' structure as an array starting with one item/Block in it as the Genesis Block which we create with our method
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2018", "Genesis Block created at start of ICO", "0");        // creates the first block in the chain at an index of 0, a timestamp at the date of the blockchain's creation (beginning of ICO for ex), the data such as explaining it is the Genesis Block (no transaction within this block), and there will be no previousHash since there is no Block to lead back to so it is just set to "0"
    }

    getLatestBlock() {                                      // retrieves the last Block added to our Blockchain, which is useful when we need to get the hash of the last Block so we can continue the chain with the next Block that requires a 'previousHash'
        return this.chain[this.chain.length - 1];           // returns the Block object at the last index of the chain array
    }

    addBlock(newBlock) {                                        // adds a new constructed Block object to the chain by placing it after the latest block in the current chain and adding that Block's hash as the newBlock's 'previousHash' variable so the newBlock links back to the previous Block and the rest of the Blockchain, in which all the Blocks are connected with hashes
        newBlock.previousHash = this.getLatestBlock().hash;     // the latest Block in the current chain has it's hash retrieved so it can be set to the 'previousHash' value in the newBlock we are adding to the chain. This will link the newBlock to the rest of the chain
     // newBlock.hash = newBlock.calculateHash();               // now that the 'previousHash' is set for the newBlock, the newBlock's hash must be recalculated with the new 'previousHash' property now set so that the newBlock's hash keeps the encoded connection to all the other Block's in the Blockchain, which will keep its integrity
        newBlock.mineBlock(this.difficulty);                    // how a Block is added with a proof-of-work, where before it is added to the chain, it must recalculate its hash with the previousHash given to it above and then have the Block mined to prove that a considerable amount of computing power was done to create the block according to the 'difficulty' defined by the specific Blockchain ('difficulty' is the Blockchain's instance variable). This ensures that the Blocks are constructed slowly by "miners" so that the Blocks are added to the chain in an orderly fashion, and so that someone can not just change several Blocks at once at the end of the chain quickly without it going unnoticed since it would take them a great deal of time with the proof-of-work mining concept especially if the difficulty is high
        this.chain.push(newBlock);                              // we then add the newBlock to the Blockchain now that its hashing is in place for the security of the Blockchain. On a real Blockchain, there would be multiple checks in place to add a Block to the Blockchain such as checking if the chain is still valid, but this is fine for this Blockchain
    }

    isChainValid() {                                    // method that verifies (true/false) the integrity of the blockchain since if one Block is trying to be changed, it will invalidate the entire Blockchain

        for(let i = 1; i < this.chain.length; i++) {        // we loop through each pair of Blocks linked together in the chain and start at index 1 so that the it starts at the Block after the Genesis Block so that the currentBlock's previousBlock is the Genesis block
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(currentBlock.hash !== currentBlock.calculateHash()) {        // first we recalculate the hash of the currentBlock and check it against the hash it has as its property, and if they do not match up then there is instantly something wrong with the integrity of the Blockchain encoding
                return false;                                           // method returns false as unvalid if hashes do not match up
            }

            if(currentBlock.previousHash !== previousBlock.hash) {      // if the 'previousHash' on the currentBlock and the hash of the actual previousBlock do not match, then the Blockchain is also invalid or something is wrong
                return false;
            }
        }

        return true;                    // if there are no mismatched hashes, then the chain is valid and the method returns true
    }
}


let titanCoin = new Blockchain();
titanCoin.addBlock(new Block(1, "01/13/2018", {amount: 4}));
titanCoin.addBlock(new Block(2, "01/19/2018", {amount: 1.2}));


console.log(JSON.stringify(titanCoin, null, 4));                    // stringify titanCoin and use 4 spaces (per tab) to format it. Stringify will display the Blockchain in JSON form we each Block in the 'chain' array


console.log('Is blockchain valid? ' + titanCoin.isChainValid());      // we call a check on integrity of the titancoin blockchain where it checks if all the hashes linking Blocks are matching correctly and it recalculates all the hashes on each Block to ensure there was no data that was tampered with. If someone had changed a property in the blockchain like data, the recalculated hash would not match the hash on the current Block and the check would fail for integrity, but if someone were to also change the property and then calculate the hash and change the hash on the Block, the hash on the Block would not match the Block in front of it on the chain that has it's hash saved as it's 'previousHash' and then the isChainValid() check will fail again... This check on this line will be true since no data was tampered with after the blocks were added

titanCoin.chain[1].data = {amount: 100};                             // if the data property is changed on a Block in the chain, the Block will have been tampered with and a valid check will come out as false

console.log('Is blockchain valid? ' + titanCoin.isChainValid());      // false since data was tampered with and recalculated hash does not match hash on Block

titanCoin.chain[1].hash = titanCoin.chain[1].calculateHash();         // if we change the hash on the Block so it matches our new property we tampered with, this will also cause the whole blockchain to fail an integrity test since the 'previousHash' on the block after will not match the recalculated hash we changed so we could tamper with the Block's data

console.log('Is blockchain valid? ' + titanCoin.isChainValid());      // false

// the blockchain should also have capabilities to roll back changes to the blockchain if an 'isChainValid()' test fails so that we can revert the blockchain back to a working manner
// our blockchain also requires a proof-of-work/proof-of-stake and a peer-to-peer network to communicate with miner nodes and it also needs digital wallet capabilities like checking if you have enough funds to make a transaction



/* without a proof-of-work solution on our blockchain, a massive amount of Blocks can be created per second and uploaded to the Blockchain, which would spam the chain instead of creating a new Block every couple seconds (or Bitcoin tries for one block ever 10 minutes) in an organized manner to keep structure to the chain..
   another problem without it is there is a security issue involved where someone can change the data on one Block along with the hash on the Block and then go ahead and rehash all the Blocks after it in the Blockchain to keep the integrity intact
 */

// the proof-of-work solution will involve proving that you've put a lot of computing power into making the Block. The process is also referred to as mining. The point is to try to throttle Blocks from being created on the chain quickly, and as computers become faster over time, the difficulty of the proof-of-work will increase so that the time frame stays constant and at a steady pace so we can keep the structure of our Blockchain

console.log('\nMining block 3...');
titanCoin.addBlock(new Block(3, "05/03/2018", {amount: 16.1}));         // now that our Blocks are mined before being added to the blockchain, you can see that our hashes begin with four 0s (00009ab...), which is because our difficulty is '4' and displays the number of 0s that will be at the beginning of our hashes and the number of times our Blocks will have their hashes recalculated in a while loop with a different incremented nonce value every time until the difficulty is reached and the point of this is to increase the amount of computational power used to create the Block so it takes longer for miners to reach the proof-of-work and construct the Blocks to the Blockchain.. If it seems like someone could still easily tamper with the last couple blocks on the chain, then you can increase the difficulty to make the proof-of-work harder and this will make it harder to tamper with multiple blocks in a fast amount of time for a hacker

console.log('Mining block 4...');
titanCoin.addBlock(new Block(4, "06/22/2018", {amount: 3.7}));

