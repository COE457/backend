const nano = require('nano');
const opts = require('./config').dbOpts; //  importing db options

const service = nano(opts.DB_URL); //  connecting to couchdb

service.db.create(opts.DB_NAME); //  creating the database if it doesn't exist

module.exports = service.use(opts.DB_NAME);
