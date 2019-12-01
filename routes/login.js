/**
 * @file login.js
 * 
 * endpoint for requesting an authentication token
 */
const jwt  = require('jsonwebtoken');
const passport = require('passport');
const jwtSecret = require('../config/constants').JWT_SECRET;
let express = require('express');

let router = express.Router(); //  router object

const db = require('../db');

router.post('/create', (req, res) => {
    router.post('/login', (req, res, next) => {
        passport.authenticate('login', (err, users, info) => {
          if (err) {
            console.error(`error ${err}`);
          }
          if (info !== undefined) {
            console.error(info.message);
            if (info.message === 'bad username') {
              res.status(401).send(info.message);
            } else {
              res.status(403).send(info.message);
            }
          } else {
            req.logIn(users, () => {
              Parent.findOne({
                where: {
                  username: req.body.username,
                },
              }).then(user => {
                const token = jwt.sign({ id: user._id }, jwtSecret, {
                  expiresIn: 60 * 60,
                });
                res.status(200).send({
                  auth: true,
                  token,
                  message: 'user found & logged in',
                });
              });
            });
          }
        })(req, res, next);
      });
})

module.exports = router; //  exporting the router object