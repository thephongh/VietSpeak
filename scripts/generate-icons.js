// Simple script to create placeholder PNG icons
// In a real app, you'd use a proper SVG to PNG converter

const fs = require('fs');
const path = require('path');

// Create a simple placeholder PNG (1x1 red pixel, scaled up)
const createPlaceholderIcon = (size) => {
  // This is a base64 encoded 1x1 red PNG
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64, 'base64');
  
  // In a real implementation, you'd properly scale the image
  // For now, we'll just create a placeholder file
  return buffer;
};

// Generate icon files
const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach(size => {
  const filename = `icon-${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, createPlaceholderIcon(size));
  console.log(`Created ${filename}`);
});

// Also create apple-touch-icon
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  createPlaceholderIcon(180)
);
console.log('Created apple-touch-icon.png');

// Create favicon.ico (same placeholder)
fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  createPlaceholderIcon(32)
);
console.log('Created favicon.ico');