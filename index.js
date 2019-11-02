const SHA256 = require("crypto-js/sha256");



let chain = [generateGenesisBlock()];
const newBlockData = {
    sender: "ks829fh28192j28d9dk9",
    receiver: "ads8d91w29jsm2822910",
    amount: 0.0023,
    currency: "BTC"
}
const newChain = addBlock(chain, newBlockData);
console.log(newChain);



function calculateHash({ previousHash, timestamp, data, nonce = 1 }) {
    return SHA256(previousHash + timestamp + JSON.stringify(data) + nonce).toString();
}

function generateGenesisBlock() {
    const block = {
        timestamp: + new Date(),
        data: "Genesis Block",
        previousHash: "0",
    };
    return {
        ...block,
        hash: calculateHash(block)
    };
}

function checkDifficulty(difficulty, hash) {
    return hash.substr(0, difficulty) === "0".repeat(difficulty)
}

// take the block and return a modified version of it
// new hash
function updateHash(block) {
    return { ...block, hash: calculateHash(block) }
}

// take the block and return a modified version of it
//new nonce
// do not edit nonce directly to avoid side effects
function nextNonce(block) {
    return updateHash({ ...block, nonce: block.nonce + 1 })
}

// recursive function to calculate hash of block until respects constraints
// trampoline for memory safe recursion
// https://www.jsmonday.dev/articles/6/adopting-memory-safe-recursion
function trampoline(func) {
    let result = func.apply(func, ...arguments);
    while (result && typeof (result) === "function") {
        result = result();
    }
    return result;
}

/*
    difficulty - how many zeros should our hash start with
    block - block we want to mine
*/
function mineBlock(difficulty, block) {
    function mine(block) {
        // create new block with modified nonce
        const newBlock = nextNonce(block);
        // if block respects rules, return it
        // if not, change nonce and mine again
        return checkDifficulty(difficulty, newBlock.hash)
            ? newBlock
            : () => mine(nextNonce(block));
    }
    // run recursively until we get correct hash for block
    return trampoline(mine(nextNonce(block)));
}

function addBlock(chain, data) {
    const { hash: previousHash } = chain[chain.length - 1];
    const block = { timestamp: + new Date(), data, previousHash, nonce: 0 }
    const newBlock = mineBlock(4, block);
    return chain.concat(newBlock);
}

// validate the chain
// tce - tail call elimination
function validateChain(chain) {
    function tce(chain, index) {
        // if genesis block, return true
        if (index === 0) return true;
        const { hash, ...currentBlockWithoutHash } = chain[index];
        const currentBlock = chain[index];
        const previousBlock = chain[index - 1];
        // is current block hash valid
        const isValidHash = (hash === calculateHash(currentBlockWithoutHash));
        // is previous block hash valid
        const isPreviousHashValid = (currentBlock.previousHash === previousBlock.hash);
        // is chain valid until now
        const isValidChain = (isValidHash && isPreviousHashValid);

        if (!isValidChain) return false;
        else return tce(chain, index - 1);
    }
    return tce(chain, chain.length - 1)
}
