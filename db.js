/**
 * @file db.js
 * 
 * @description used for initializing database settings
 */
const nano = require('nano'); //  to communicate with couch
const opts = require('./config').dbOpts; //  importing db options
const fs = require('fs'); //  for reading JSON files 

const service = nano(opts.DB_URL); //  connecting to couchdb

//  creating the database if it doesn't exist
service.db.create(opts.DB_NAME).then(db => {
    console.log(`${JSON.stringify(db)} successfully created!`);
}).catch(err => {
    if (err.error === "file_exists") {
        console.log("database already exists. Previous entries were not affected");
    }
}).finally(() => {
    const db = service.use(opts.DB_NAME);
    const designDocs = JSON.parse(fs.readFileSync('./config/designDocs.json'));
    const sortedSensors = designDocs.sortedSensors;
    const smartwatchRelated = designDocs.smartwatchRelated;

    db.insert(sortedSensors).then(views => {
        console.log(`${views.id} successfully added to db!`);
    }).catch(err => {
        if (err.error === "conflict") {
            console.log("views already loaded. To update views, manually delete '_design/sortedSensors'");
        }
    });

    db.insert(smartwatchRelated).then(views => {
        console.log(`${views.id} successfully added to db!`);
    }).catch(err => {
        if (err.error === "conflict") {
            console.log("views already loaded. To update views, manually delete '_design/smartwatchRelated'");
        }
    });

    module.exports = db;
})




