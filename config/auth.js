const bcrypt = require('bcrypt');
const jwtSecret = require('./constants').JWT_SECRET;


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const db = require('../db');


passport.use(
	'login',
	new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password',
			session: false,
		},
		(username, password, done) => {

			db.get(username).then(user => {
				if (user === null) {
					return done(null, false, { message: 'bad username' });
				}
				bcrypt.compare(password, user.password).then(response => {
					if (response !== true) {
						console.log('passwords do not match');
						return done(null, false, { message: 'passwords do not match' });
					}
					console.log('user found & authenticated');
					return done(null, user);
				});


			}).catch(err => {
				done(err);
			});

		},
	),
);

const opts = {
	jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
	secretOrKey: jwtSecret,
};

passport.use(
	'jwt',
	new JWTstrategy(opts, (jwt_payload, done) => {
		try {
			User.findOne({
				where: {
					id: jwt_payload.id,
				},
			}).then(user => {
				if (user) {
					console.log('user found in db in passport');
					done(null, user);
				} else {
					console.log('user not found in db');
					done(null, false);
				}
			});
		} catch (err) {
			done(err);
		}
	}),
);
