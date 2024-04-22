/*
  create_user.js
*/

var readlineSync = require('readline-sync');
const User = require('../user.js');

(async () => {
  let params = {};
  let cleartext2 = 'not undefined';
  params.privileges = {};
  params.email = readlineSync.question('email: ');
  params.first_name = readlineSync.question('first name: ');
  params.last_name = readlineSync.question('last name: ');

  while (params.cleartext != cleartext2) {
    params.cleartext = readlineSync.question('password: ', {
      hideEchoBack: true
    });
    cleartext2 = readlineSync.question('re-enter password: ', {
      hideEchoBack: true
    });
  }

  if (readlineSync.keyInYN('make admin? ')) {
    params.privileges = { role: 'super_admin' };
  }

  let user = await User.create(params);
  console.log(`${JSON.stringify(user, null, 2)}`);
})();
