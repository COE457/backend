/**
 * @file smartwatch.js
 *
 * @description used to make CRUD operations unified for all Smartwatch docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages


class Smartwatch {
  constructor() {
    //  setting the required keys
    this.columns = ["serialNumber", "active"];
    this.owner = ["Parent"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new smartwatch to the database iff the serialnumber was not a duplicate and the body contains all required keys
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
        //  grabbing all serialNumbers in db
        var serialNumbers = await db.find({
          selector: { docType: "Smartwatch" },
          fields: ["serialNumber"]
        });
      } catch (err) {
        //  catch db errors
        reject(errors.databaseError(err));
        return;
      }

      //  checking for duplicate serialNumbers
      if (serialNumbers.docs.map(item => item.serialNumber).includes(body.serialNumber)) {
        reject(errors.duplicate("SerialNumber", body.serialNumber)); //  reject duplicate entry
        return; //  exiting the function
      }

      try {
        //  grabbing all _id's of Childs in db
        var ids = await db.get(body.Child);
      } catch (err) {
        //  if child doesn't exist
        reject(errors.notInTheDataBase(body.Child));
        return;
      }

      //  delete extra keys from body
      let keys = Object.keys(body); //  body keys
      keys.forEach(item => {
        if (!this.columns.concat(this.owner).includes(item)) {
          delete body[item]; //  if the key was not in the "restricted", delete it
        }
      });

      body.docType = "Smartwatch"; //  adding document type to body

      //  adding entry to db
      try {
        var newSmartwatch = await db.insert(body);
        resolve(newSmartwatch); //  resolving the promise and returning newChild
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
   * @description removes smartwatcg based on _id and _rev or serialNumber
   *
   *
   * @todo fix warnings
   * @todo cascade deletion when ./child.js is ready
   */
  destroy(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id && body._rev) {
        //  if id was provided
        try {
          const deletedSmartwatch = await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedSmartwatch);
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
          return;
        }
      } else if (body.serialNumber) {
        //  if serialNumber but not id was provided, find id and rev
        try {
          const target = await db.find({
            selector: {
              docType: "Smartwatch",
              serialNumber: body.serialNumber
            },
            fields: ["_id", "_rev"]
          });
          if (target.docs.length == 0) {
            //  reject in case of no results
            reject(errors.notInTheDataBase(body.serialNumber));
            return;
          }
          const _id = target.docs[0]._id;
          const _rev = target.docs[0]._rev;
          const deletedSmartwatch = await db.destroy(_id, _rev); //  attempt to destroy
          resolve(deletedSmartwatch);
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
   * @description lists smartwatch based on _id, or other attributes
   */
  read(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id) {
        try {
          //  if id was provided
          const foundSmartwatch = await db.get(body._id); //  get the child that matches the id
          resolve(foundSmartwatch); //  return and resolve promise
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
        selector.docType = "Smartwatch"; //  search only Child docs

        //  add the "selector" key to the whole thing
        selector = { selector: selector };
        const foundSmartwatchs = await db.find(selector); //  get all matches
        resolve(foundSmartwatchs); //  return and resolve promise
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
   * @description updates smartwach based on _id and _rev or serialNumber
   */
  update(body) {
    return new Promise(async (resolve, reject) => {
      if (!((body._id && body._rev) || body.serialNumber)) {
        //  in case not enough parameters were provided
        reject(errors.missingKeys); //  reject and return
        return;
      }

      // finding the document that will be edited
      let search = //  setting up the search term based on available data
        body._id && body._rev
          ? {
              docType: "Smartwatch",
              _id: body._id
            }
          : {
              docType: "Smartwatch",
              serialNumber: body.serialNumber
            };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;

      //  deleting Child to prevent changing child
      if (body.Child) delete body.Child;

      try {
        var target = await db //  finding Smartwatches
          .find({
            //  find all children with serialNumber
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
        //  in case serialNumber needs to be changed
        if (body.newSerialNumber) {
          body.serialNumber = body.newSerialNumber;
          delete body.newSerialNumber;
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

        const updatedSmartwatch = await db.insert(tmpBody); //  attempt edit
        resolve(updatedSmartwatch); //  resolve and return
      }
    });
  }
}

module.exports = Smartwatch;
