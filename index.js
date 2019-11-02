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
    }
}

console.log(generateGenesisBlock());

