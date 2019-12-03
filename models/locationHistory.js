/**
 * @file locationHistory.js
 *
 * @description used to make CRUD operations unified for all Child docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages

class LocationHistory {
  constructor() {
    //  setting the required keys
    this.columns = ["location", "currentlyThere", "date"];
    this.owner = ["Smartwatch"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new locationHistory to the database iff the name was not a duplicate and the body contains all required keys
   */

  //  performs creation based on this.column
  create(body) {
    return new Promise(async (resolve, reject) => {
      //  checking for missing keys
      if (
        !this.columns
          .concat(this.owner)
          .every(item => Object.keys(body).includes(item))
      ) {
        reject(errors.missingKeys); //  exit the function and return a promise reject
        return; //  exiting the function
      }

      try {
        //  grabbing all names in db
        var names = await db.find({
          selector: { docType: "LocationHistory" },
          fields: ["location", "currentlyThere", "date"]
        });
      } catch (err) {
        //  catch db errors
        reject(errors.databaseError(err));
        return;
      }

      try {
        //  grabbing all _id's of Smartwatchs in db
        var ids = await db.get(body.Smartwatch);
      } catch (err) {
        //  if smartwatch doesn't exist
        reject(errors.notInTheDataBase(body.Smartwatch));
        return;
      }

      //  delete extra keys from body
      let keys = Object.keys(body); //  body keys
      keys.forEach(item => {
        if (!this.columns.concat(this.owner).includes(item)) {
          delete body[item]; //  if the key was not in the "restricted", delete it
        }
      });

      body.docType = "LocationHistory"; //  adding document type to body

      //  adding entry to db
      try {
        var newChild = await db.insert(body);
        resolve(newChild); //  resolving the promise and returning newChild
      } catch (err) {
        //  catch db errors
        reject(errors.databaseError(err));
        return;
      }
    });
  }

  /**
   * @function destroy
   * @param {Object} body
   * @fires db.find
   * @fires db.destroy
   * @returns Promise.resolve or Promise.reject
   * @description removes locationHistory based on _id and _rev
   *
   *
   * @todo fix warnings
   * @todo cascade deletion when ./locationHistory.js is ready
   */
  destroy(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id && body._rev) {
        //  if id was provided
        try {
          const deletedChild = await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedChild);
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
          return;
        }
      } else {
        reject(errors.missingKeys);
      }
    });
  }

  /**
   * @function read
   * @param {Object} body
   * @fires db.find
   * @fires db.get
   * @returns Promise.resolve
   * @description lists location based on search query
   */
  read(body) {
    return new Promise(async (resolve, reject) => {

      //  if trying to find range
      body.descending = (body.startkey || body.endkey)? false:true;
      if(body.startkey) body.startkey = Number(body.startkey); //  making sure keys are numbers 
      if(body.endkey) body.endkey = Number(body.endkey);

      //  default vs custom behaviour
      let page = !isNaN(body.page)? body.page : 0;
      let rows = !isNaN(body.rows)? body.rows : 10;

      //  from page and rows to skips and limits
      body.skip = page * rows;
      body.limit = Number(rows);

      try{
        const result = await db.view('sortedSensors', 'LocationHistory', body);
        resolve(result);
      } catch (err) {
        reject(errors.databaseError(err));
      }
    });
  }

  /**
   * @function update
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description updates locationHistory based on _id and _rev or name
   */
  update(body) {
    return new Promise(async (resolve, reject) => {
      if (!((body._id && body._rev) || body.date)) {
        //  in case not enough parameters were provided
        reject(errors.missingKeys); //  reject and return
        return;
      }

      // finding the document that will be edited
      let search = //  setting up the search term based on available data
        body._id && body._rev
          ? {
              docType: "LocationHistory",
              _id: body._id
            }
          : {
              docType: "LocationHistory",
              date: body.date
            };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;

      //  deleting Smartwatch to prevent changing smartwatch
      if (body.Smartwatch) delete body.Smartwatch;

      try {
        var target = await db //  finding LocationHistories
          .find({
            //  find all locationHistories with name
            selector: search
          });
        if (target.docs.length == 0) {
          //  reject in case of no results
          reject(errors.notInTheDataBase(JSON.stringify(search)));
          return;
        }
      } catch (err) {
        //  reject in case of db errors
        reject(errors.databaseError(err));
        return;
      } finally {
        //  delete extra keys from body
        let keys = Object.keys(body); //  body keys
        let restricted = this.columns
          .concat(this.owner)
          .concat(["_id", "_rev"]); //  allowed keys
        keys.forEach(item => {
          if (!restricted.includes(item)) {
            delete body[item]; //  if the key was not in the "restricted", delete it
          }
        });

        //  setting up a temporary body to keep values that don't need to be changed intact
        let tmpBody = target.docs[0];
        Object.keys(body).forEach(item => {
          tmpBody[item] = body[item];
        });

        const updatedChild = await db.insert(tmpBody); //  attempt edit
        resolve(updatedChild); //  resolve and return
      }
    });
  }
}

module.exports = LocationHistory;
