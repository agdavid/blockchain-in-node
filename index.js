const SHA256 = require("crypto-js/sha256");

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

console.log(generateGenesisBlock());

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
