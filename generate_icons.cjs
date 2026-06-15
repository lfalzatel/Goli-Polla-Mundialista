const fs = require('fs');
const sharp = require('sharp');

const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#034226"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#e1b12c" stroke-width="30"/>
  <path d="M256 106v300M106 256h300" stroke="#e1b12c" stroke-width="30" stroke-linecap="round"/>
  <text x="256" y="290" font-family="Arial" font-weight="bold" font-size="120" fill="white" text-anchor="middle">GOLI</text>
</svg>`;

fs.writeFileSync('public/masked-icon.svg', svg);

Promise.all([
  sharp(Buffer.from(svg)).resize(192, 192).toFile('public/pwa-192x192.png'),
  sharp(Buffer.from(svg)).resize(512, 512).toFile('public/pwa-512x512.png'),
  sharp(Buffer.from(svg)).resize(180, 180).toFile('public/apple-touch-icon.png'),
  sharp(Buffer.from(svg)).resize(64, 64).toFile('public/favicon.ico')
]).then(() => console.log('Icons created successfully'))
  .catch(err => console.error(err));
