/**
 * @file panicHistory.js
 *
 * @description used to make CRUD operations unified for all panicHistory docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages

//  for checking if a smartwacch exists or not
const smartwatch = require("./smartwatch");
const Smartwatch = new smartwatch();

class PanicHistory {
  constructor() {
    //  setting the required keys
    this.columns = ["date","dismissed"];
    this.owner = ["Smartwatch"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new panicHistory to the database iff the name was not a duplicate and the body contains all required keys
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
        //  grabbing all panics and dates in db
        var panics = await db.find({
          selector: { docType: "PanicHistory" },
          fields: ["date","dismissed"]
        });
      } catch (err) {
        //  catch db errors
        reject(errors.databaseError(err));
        return;
      }

      //  checking for duplicate date
      if (panics.docs.map(item => item.date).includes(body.date)) {
        reject(errors.duplicate("date", body.date)); //  reject duplicate entry
        return; //  exiting the function
      }

      try {
        //  grabbing all _id's of Smartwatch in db
        var ids = await db.get(body.Smartwatch);
      } catch (err) {
        //  if parent doesn't exist
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

      body.docType = "PanicHistory"; //  adding document type to body

      //  adding entry to db
      try {
        var newPanicHistory = await db.insert(body);
        resolve(newPanicHistory); //  resolving the promise and returning newPanicHistory
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
   * @description removes panicHistory based on _id and _rev or date
   *
   *
   * @todo fix warnings
   * @todo cascade deletion when ./panicHistory.js is ready
   */
  destroy(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id && body._rev) {
        //  if id was provided
        try {
          const deletedPanicHistory= await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedPanicHistory);
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
          return;
        }
      } else if (body.date) {
        //  if name but not id was provided, find id and rev
        try {
          const target = await db.find({
            selector: {
              docType: "PanicHistory",
              date: body.date
            },
            fields: ["_id", "_rev"]
          });
          if (target.docs.length == 0) {
            //  reject in case of no results
            reject(errors.notInTheDataBase(body.date));
            return;
          }
          const _id = target.docs[0]._id;
          const _rev = target.docs[0]._rev;
          const deletedPanicHistory = await db.destroy(_id, _rev); //  attempt to destroy
          resolve(deletedPanicHistory);
          return;
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
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
   * @description lists panics based on _id, or other attributes
   */
  read(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id) {
        try {
          //  if id was provided
          const foundPanicHistory= await db.get(body._id); //  get the panicHistory that matches the id
          resolve(foundPanicHistory); //  return and resolve promise
        } catch (err) {
          reject(errors.notInTheDataBase(body._id));
        }
        return;
      } else {
        //  if id was not provided

        //  setup a selector based on regex to find all similar cases
        let selector = Object.keys(body).map(item => {
          return { [item]: { $regex: "(" + body[item] + ")+" } };
        });

        //  assemble the object array into a single object
        selector = Object.assign({}, ...selector);
        selector.docType = "PanicHistory"; //  search only PanicHistory docs

        //  add the "selector" key to the whole thing
        selector = { selector: selector };
        const foundPanicHistories = await db.find(selector); //  get all matches
        resolve(foundPanicHistories); //  return and resolve promise
        return;
      }
    });
  }

  /**
   * @function update
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description updates panicHistory based on _id and _rev or name
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
              docType: "PanicHistory",
              _id: body._id
            }
          : {
              docType: "PanicHistory",
              date: body.date,
              };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;

      //  deleting SmartWatch to prevent changing SmartWatch
      if (body.Smartwatch) delete body.Smartwatch;

      try {
        var target = await db //  finding PanicHistories
          .find({
            //  find all PanicHistory with date
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
        //  in case date needs to be changed
        if (body.newDate) {
          body.date = body.newDate;
          delete body.newDate;
        }
        if (body.newDismiss)
        {
          body.dismissed = body.newDismiss;
          delete body.newDismiss;
        }
  
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

        const updatedPanicHistory = await db.insert(tmpBody); //  attempt edit
        resolve(updatedPanicHistory); //  resolve and return
      }
    });
  }
}

module.exports = PanicHistory;
