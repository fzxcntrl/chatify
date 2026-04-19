const fs = require('fs');
const path = require('path');
const lucidePath = path.join(__dirname, '../node_modules/lucide-react/dist/cjs/lucide-react.js');
const lucide = require(lucidePath);

console.log("VolumeOffIcon:", !!lucide.VolumeOffIcon);
console.log("VolumeXIcon:", !!lucide.VolumeXIcon);
console.log("VolumeOff:", !!lucide.VolumeOff);
console.log("VolumeX:", !!lucide.VolumeX);
