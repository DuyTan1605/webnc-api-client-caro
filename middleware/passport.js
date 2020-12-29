const passport = require("passport");
const passportJWT = require("passport-jwt");
const bcrypt = require("bcrypt");
const {getDate} = require("../public/helpers/helpers")
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const JWTStrategy = passportJWT.Strategy;
const JWTExtract = passportJWT.ExtractJwt;

const configAuth = require('../utils/oauth');
const userModel = require("../model/user.model");

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
})

passport.use(new JWTStrategy({
        jwtFromRequest: JWTExtract.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'caro_client'
    },
    (jwtPayload, done) => {
        console.log(jwtPayload)
        // find the others information of user in database if needed
        return userModel.get({key:"id",value:jwtPayload.id}).then(user => {
            return done(null, user);
        }).catch(err => {
            return done(err);
        });
    }
));

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    (username, password, done) => {
        userModel.get({key:"email",value:username}).then(rows => {
            if (rows.length === 0) {
                return done(null, false, {
                    message: 'Tài khoản không tồn tại'
                });
            }
            var user = rows[0];
            // compare password
            var ret = bcrypt.compareSync(password, user.password);
            if (ret) {

                // for security, send only username
                return done(null, {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    point: user.point,
                    account_type: user.account_type,
                    avatar: user.avatar
                });
            } else {
                return done(null, false, {
                    message: 'Mật khẩu không chính xác'
                })
            }
        }).catch(err => {
            return done(err, false);
        })
    }
));

passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields:  ['id', 'displayName', 'photos', 'emails']
    },
    // facebook will send user token and profile information
    function (token, refreshToken, profile, done) {
        // this is asynchronous
        process.nextTick(function () {
            console.log("Profile is: ",profile)
            // look up into database to see if it already has this user
            userModel.get({key:"email",value:profile.id}).then(rows => {

                // if account exists, just return it
                if (rows.length > 0) {
                    return done(null, {
                        name: rows[0].name,
                        id: rows[0].id,
                        email: rows[0].email,
                        created_at : rows[0].created_at,
                        point: rows[0].point,
                        account_type: rows[0].account_type,
                        avatar: rows[0].avatar
                    });
                }

                // if it doesn't have any, create one
                var entity = {
                    name: profile.displayName,
                    password: token,
                    email: profile.id,
                    created_at: getDate(),
                    account_type:3,
                    avatar: profile.photos[0].value,
                    point:0
                }

                // add to database
                userModel.add(entity).then(id => {
                    return done(null, entity);
                }).catch(err => {
                    console.log("Error when add facebook user: ", err);
                    return done(null, false);
                });

            }).catch(err => {
                if (err) {
                    console.log("Error when get user by facebook id: ", err);
                    return done(null, false);
                }
            });
        });
    }));

passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
    },

    // exactly the same as facebook
    function (token, refreshToken, profile, done) {
       
        process.nextTick(function () {

           // look up into database to see if it already has this user
            userModel.getAccountByType({key:"email",value:profile.emails[0].value,account_type:2}).then(rows => {

                // if account exists, just return it
                if (rows.length > 0) {
                    return done(null, {
                        name: rows[0].name,
                        id: rows[0].id,
                        email: rows[0].email,
                        created_at : rows[0].created_at,
                        point: rows[0].point,
                        account_type: rows[0].account_type,
                        avatar: rows[0].avatar
                    });
                }

                // if it doesn't have any, create one
                var entity = {
                    name: profile.displayName,
                    password: token,
                    email: profile.emails[0].value,
                    account_type: 2,
                    point: 0,
                    avatar: profile.photos[0].value,
                    created_at: getDate()
                }

                // add to database
                userModel.add(entity).then(id => {
                    return done(null, entity);
                }).catch(err => {
                    console.log("Error when add google user: ", err);
                    return done(null, false);
                });

            }).catch(err => {
                if (err) {
                    console.log("Error when get user by google id: ", err);
                    return done(null, false);
                }
            });
        });
    }));