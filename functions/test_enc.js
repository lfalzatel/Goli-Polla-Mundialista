const fs = require('fs');
const code = fs.readFileSync('index.js', 'utf8');
const match = code.match(/"curazao":\s*"([^"]+)"/);
console.log(match[1]);
console.log(Buffer.from(match[1]).toString('hex'));
console.log(Buffer.from("Curaçao").toString('hex'));
