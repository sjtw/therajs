var thera = require('../dist/thera.js');

var xmlClient = new thera.XmlClient();

xmlClient
  .setKeyID('5052100')
  .setVCode('jqPQnIj5FnT6obJulCdnQF514NFlIW2sjV3M6EFfWAxLG9tVNGXXbhgcdp9Rbzon')
  .get('account/Characters')
  .then(accountCharacters => {
    xmlClient.setCharacterID(accountCharacters.result.rowset.row[0].characterID);
    return Promise.all([
        xmlClient.get('char/AccountBalance'),
        xmlClient.get('char/WalletTransactions'),
        xmlClient.get('char/WalletJournal')
      ]).catch(err => {console.log(err);});
  })
  .then((values) => {
  	console.log(values);
  	console.log(xmlClient.cache);
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });