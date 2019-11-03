const nano = require('nano');
const opts = require('./config').dbOpts; //  importing db options

const service = nano(opts.DB_URL); //  connecting to couchdb

//  creating the database if it doesn't exist
service.db.create(opts.DB_NAME).catch(err => {
    console.log(err.error);
})


module.exports = service.use(opts.DB_NAME);
