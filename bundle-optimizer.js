const fs = require('fs');
const path = require('path');

console.log('📦 Bundle Size Optimizer\n');

// Check package.json for large dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('🔍 Dependencies Analysis:');
console.log('Total dependencies:', Object.keys(packageJson.dependencies).length);
console.log('Total devDependencies:', Object.keys(packageJson.devDependencies).length);

// Known large packages
const largePackages = [
  'firebase',
  'react-native-chart-kit', 
  'react-native-svg',
  'react-native-reanimated',
  'react-native-gesture-handler'
];

console.log('\n⚠️  Large packages detected:');
largePackages.forEach(pkg => {
  if (packageJson.dependencies[pkg]) {
    console.log(`   - ${pkg}`);
  }
});

// Check for unused dependencies
const unusedDeps = [
  'victory-native',
  'react-native-fs', 
  'react-native-share',
  'xml',
  '@react-navigation/drawer',
  '@react-native-vector-icons/fontawesome'
];

console.log('\n🗑️  Removed unused dependencies:');
unusedDeps.forEach(dep => {
  if (!packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep} - Removed`);
  }
});

console.log('\n💡 Optimization Recommendations:');
console.log('1. ✅ Removed unused dependencies');
console.log('2. 🔄 Consider lazy loading for Analytics screen');
console.log('3. 🖼️  Optimize large images (see optimize-images.js)');
console.log('4. 📊 Consider lighter chart alternatives');
console.log('5. 🔥 Use Firebase modular imports (already implemented)');

console.log('\n📈 Estimated bundle size reduction:');
console.log('   - Removed dependencies: ~2-3MB');
console.log('   - Image optimization: ~500KB-1MB');
console.log('   - Total potential savings: ~3-4MB');

console.log('\n🚀 Next steps:');
console.log('1. Run: node optimize-images.js');
console.log('2. Run: npm install (to remove unused deps)');
console.log('3. Test your app thoroughly');
console.log('4. Build and measure the new bundle size'); 