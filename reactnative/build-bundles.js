const { execSync } = require('child_process');
const path = require('path');

const bundles = [
  { name: 'login', entry: 'entry-points/login.js' },
  { name: 'home', entry: 'entry-points/home.js' },
  { name: 'transfer', entry: 'entry-points/transfer.js' },
  { name: 'movements', entry: 'entry-points/movements.js' },
];

const rootDir = path.resolve(__dirname);
const androidBundlesDir = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'bundles');

bundles.forEach((bundle) => {
  const outputPath = path.join(androidBundlesDir, bundle.name, 'index.android.bundle');
  const cmd = `npx react-native bundle --platform android --dev false --entry-file ${bundle.entry} --bundle-output ${outputPath} --assets-dest ../android/app/src/main/res`;
  console.log(`Construyendo bundle: ${bundle.name}`);
  execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
  console.log(`Bundle ${bundle.name} construido exitosamente`);
});

console.log('Todos los bundles construidos exitosamente');
