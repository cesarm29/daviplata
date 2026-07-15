const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const bundles = [
  { name: 'login', entry: 'entry-points/login.js' },
  { name: 'home', entry: 'entry-points/home.js' },
  { name: 'transfer', entry: 'entry-points/transfer.js' },
  { name: 'movements', entry: 'entry-points/movements.js' },
];

const rootDir = path.resolve(__dirname);
const hermesPath = path.join(rootDir, 'node_modules', 'react-native', 'sdks', 'hermesc', 'win64-bin', 'hermesc.exe');
const bundlesDir = path.resolve(__dirname, '..', 'bundles');
const androidBundlesDir = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'bundles');

const hasHermes = fs.existsSync(hermesPath);
console.log(`Hermes compiler: ${hasHermes ? 'disponible' : 'NO disponible'}`);

bundles.forEach((bundle) => {
  const bundleDir = path.join(bundlesDir, bundle.name);
  fs.mkdirSync(bundleDir, { recursive: true });

  const jsOutput = path.join(bundleDir, 'index.android.bundle');
  const jsTemp = path.join(bundleDir, 'index.temp.js');
  const sourceMap = path.join(bundleDir, 'index.android.map');

  console.log(`\n=== ${bundle.name}: Metro bundle ===`);
  execSync(
    `npx react-native bundle --platform android --dev false --entry-file ${bundle.entry} --bundle-output ${jsTemp} --assets-dest ${path.join(rootDir, '..', 'android', 'app', 'src', 'main', 'res')}`,
    { cwd: rootDir, stdio: 'inherit' }
  );
  const jsSize = fs.statSync(jsTemp).size;

  if (hasHermes) {
    console.log(`${bundle.name}: Hermes compile + optimizacion`);
    execSync(
      `"${hermesPath}" -emit-binary -O -g0 -fstrip-function-names -out "${jsOutput}" "${jsTemp}"`,
      { cwd: rootDir, stdio: 'inherit' }
    );
    fs.unlinkSync(jsTemp);
    if (fs.existsSync(sourceMap)) fs.unlinkSync(sourceMap);
    const hbcSize = fs.statSync(jsOutput).size;
    console.log(`${bundle.name}: JS=${(jsSize/1024).toFixed(1)}KB → HBC=${(hbcSize/1024).toFixed(1)}KB (${(hbcSize/jsSize*100).toFixed(1)}%)`);
  } else {
    fs.renameSync(jsTemp, jsOutput);
    console.log(`${bundle.name}: ${(jsSize/1024).toFixed(1)} KB (JS, sin Hermes)`);
  }

  const androidDir = path.join(androidBundlesDir, bundle.name);
  fs.mkdirSync(androidDir, { recursive: true });
  fs.copyFileSync(jsOutput, path.join(androidDir, 'index.android.bundle'));
});

console.log('\n=== Todos los bundles optimizados ===');