const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MF', size / 2, size / 2);
    
    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
    console.log(`Created icon-${size}x${size}.png`);
});
