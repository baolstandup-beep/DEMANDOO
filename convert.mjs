import sharp from 'sharp';
const input = 'public/hero-banner.jpg';
await sharp(input).resize(1200).webp({ quality: 80 }).toFile('public/hero-banner-1200.webp');
await sharp(input).resize(800).webp({ quality: 80 }).toFile('public/hero-banner-800.webp');
await sharp(input).resize(400).webp({ quality: 80 }).toFile('public/hero-banner-400.webp');
console.log('Conversion done.');
