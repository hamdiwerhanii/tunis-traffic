process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/verify-build';

await import('../dist/app.module.js');
console.log('Build OK: every compiled module loads in native ES module mode');
