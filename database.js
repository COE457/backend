const nano = require('nano')('http://localhost:5984');
nano.db.create('childmonitoring')
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log("Error: " + err.error);
  });

const alice = nano.db.use('childmonitoring');

