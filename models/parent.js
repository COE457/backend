/**
 * @file parent.js
 *
 * @description used to make CRUD operations unified for all Parent docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages

//  for hashing passwords
const bcrypt = require("bcrypt");
const BCRYPT_SALT_ROUNDS = 12;

class Parent {
  constructor() {
    //  setting the required keys
    this.columns = ["_id", "email", "password", "phoneNumber"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new parent to the database iff the _id was not a duplicate and the body contains all required keys
   */

  //  performs creation based on this.column
  create(body) {
    return new Promise(async (resolve, reject) => {
      //  checking for missing keys
      if (!this.columns.every(item => Object.keys(body).includes(item))) {
        reject(errors.missingKeys); //  exit the function and return a promise reject
        return; //  exiting the function
      }

      //  delete extra keys from body
      let keys = Object.keys(body); //  body keys
      keys.forEach(item => {
        if (!this.columns.includes(item)) {
          delete body[item]; //  if the key was not in the "restricted", delete it
        }
      });

      body.docType = "Parent"; //  adding document type to body

      //  inserting the password into a hash function
      bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS).then(async hash => {
        body.password = hash; //  replacing the pass
        //  adding entry to db
        try {
          var newParent = await db.insert(body);
          resolve(newParent); //  resolving the promise and returning newParent
        } catch (err) {
          if (err.error === "conflict") {
            reject(errors.duplicate("Username", body._id)); //  reject duplicate entry
            return;
          } else {
            //  catch db errors
            reject(errors.databaseError(err));
            return;
          }
        }
      });
    });
  }

  /**
   * @function destroy
   * @param {Object} body
   * @fires db.find
   * @fires db.destroy
   * @returns Promise.resolve or Promise.reject
   * @description removes parent based on _id and _rev or _id
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
          const deletedParent = await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedParent);
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
          return;
        }
      } else if (body._id) {
        //  if _id but not id was provided, find id and rev
        try {
          const target = await db.find({
            selector: {
              docType: "Parent",
              _id: body._id
            },
            fields: ["_id", "_rev"]
          });
          if (target.docs.length == 0) {
            //  reject in case of no results
            reject(errors.notInTheDataBase(body._id));
            return;
          }
          const _id = target.docs[0]._id;
          const _rev = target.docs[0]._rev;
          const deletedParent = await db.destroy(_id, _rev); //  attempt to destroy
          resolve(deletedParent);
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
   * @description lists parents based on _id, or other attributes
   */
  read(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id) {
        try {
          //  if id was provided
          const foundParent = await db.get(body._id); //  get the parent that matches the id
          resolve(foundParent); //  return and resolve promise
          return;
        } catch (err) {
          reject(errors.notInTheDataBase(body._id));
          return;
        }
      } else {
        //  if id was not provided

        //  setup a selector based on regex to find all similar cases
        let selector = Object.keys(body).map(item => {
          return { [item]: { $regex: "(" + body[item] + ")+" } };
        });

        //  assemble the object array into a single object
        selector = Object.assign({}, ...selector);
        selector.docType = "Parent"; //  search only Parent docs

        //  add the "selector" key to the whole thing
        selector = { selector: selector };
        const foundParents = await db.find(selector); //  get all matches
        resolve(foundParents); //  return and resolve promise
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
   * @description updates parent based on _id and _rev or _id
   */
  update(body) {
    return new Promise(async (resolve, reject) => {
      if (!((body._id && body._rev) || body._id)) {
        //  in case not enough parameters were provided
        reject(errors.missingKeys); //  reject and return
        return;
      }

      // in case password needs to be changed
      if (body.password) {
        const hash = await bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS);
        body.password = hash;
      }

      // finding the document that will be edited
      let search = //  setting up the search term based on available data
        body._id && body._rev
          ? {
            docType: "Parent",
            _id: body._id
          }
          : {
            docType: "Parent",
            _id: body._id
          };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;
      try {
        var target = await db //  finding Parents
          .find({
            //  find all parents with _id
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
        //  in case _id needs to be changed
        if (body.newUsername) {
          body._id = body.newUsername;
          delete body.newUsername;
        }

        //  delete extra keys from body
        let keys = Object.keys(body); //  body keys
        let restricted = this.columns.concat(["_id", "_rev"]); //  allowed keys
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

        const updatedParent = await db.insert(tmpBody); //  attempt edit
        resolve(updatedParent); //  resolve and return
      }
    });
  }
}

module.exports = Parent;
