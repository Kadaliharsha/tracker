const fs = require('fs');
const path = require('path');

// Image optimization script
console.log('🔍 Analyzing image sizes...\n');

const assetsDir = path.join(__dirname, 'app', 'assets');
const rootAssetsDir = path.join(__dirname, 'assets');

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2); // Convert to KB
}

function analyzeDirectory(dir, dirName) {
  if (!fs.existsSync(dir)) return;
  
  console.log(`📁 ${dirName}:`);
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
      const filePath = path.join(dir, file);
      const size = getFileSize(filePath);
      console.log(`   ${file}: ${size} KB`);
      
      if (size > 100) {
        console.log(`   ⚠️  Large file! Consider optimizing ${file}`);
      }
    }
  });
  console.log('');
}

analyzeDirectory(assetsDir, 'app/assets');
analyzeDirectory(rootAssetsDir, 'assets');

console.log('💡 Optimization suggestions:');
console.log('1. Use tools like TinyPNG or ImageOptim to compress images');
console.log('2. Consider using WebP format for better compression');
console.log('3. Resize images to the actual display size needed');
console.log('4. Remove unused images');
console.log('\n🚀 Run: npm install -g imagemin-cli');
console.log('   Then: imagemin app/assets/* --out-dir=app/assets/optimized'); 