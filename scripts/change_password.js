/*
  change_password.js
*/

var readlineSync = require('readline-sync');
const User = require('../user.js');

(async () => {
  let params = {};
  let cleartext2 = 'not undefined';
  params.email = readlineSync.question('email: ');

  while (!params.cleartext || params.cleartext != cleartext2) {
    params.cleartext = readlineSync.question('new password: ', {
      hideEchoBack: true
    });
    cleartext2 = readlineSync.question('re-enter new password: ', {
      hideEchoBack: true
    });
  }

  let result = await User.update_password(params);
  console.log(result);
})();
