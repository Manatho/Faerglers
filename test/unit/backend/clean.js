let rmDir = require('rimraf');
console.log('Removing temporary directory: test/temp');
rmDir('test/temp', err => {
  if (err) {
    console.log(err);
  }
});
