const express = require('express');
const accountRoute = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const saltRound = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

const { users: accountModel } = require("../models/index");
const jwtHelper = require("../public/helpers/jwtHelper");

let tokenList = {};
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const AuthMiddleWare = require("../middleware/AuthMiddleware");
const axios = require("axios");

accountRoute.post("/login", async function (req, res) {
  const users = await accountModel.findAll()

  if (req.body.email && req.body.password) {
    var email = req.body.email;
    var password = req.body.password;
  }
  // usually this would be a database call:
  var user = users[_.findIndex(users, { email: email })];
  console.log(user);
  if (!user) {
    return res.status(401).json({ message: "Account is not existed" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    var payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      point: user.point,
      account_type: user.account_type,
      avatar: user.avatar
    };
    // var token = jwt.sign(payload, jwtOptions.secretOrKey,{expiresIn:"1h"});
    // return res.json({message: "ok", token: token});
    const accessToken = await jwtHelper.generateToken(payload, accessTokenSecret, accessTokenLife);

    const refreshToken = await jwtHelper.generateToken(payload, refreshTokenSecret, refreshTokenLife);

    tokenList[refreshToken] = { accessToken, refreshToken };

    return res.status(200).json({ accessToken, refreshToken, ...payload });
  } else {
    return res.status(401).json({ message: "invalid credentials" });
  }
})


accountRoute.post("/loginWithSocial", async function (req, res) {
  const users = await accountModel.findAll()
  console.log(req.headers["x-access-token"]);
  console.log(req.body);
  if (req.body.type == "google") {
    const result = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.tokenId}`);

    const data = await result.data;

    console.log(data);

    if (!data.error_description) {
      let user = users[_.findIndex(users, { email: data.email, account_type: 3 })]
      if (!user) {
        await accountModel.create({ name: data.name, email: data.email, created_at: req.body.created_at, account_type: 3, avatar: data.picture });

        let payload = { id: users[users.length - 1].id + 1, email: data.email, name: data.name, created_at: req.body.created_at, account_type: 3, avatar: data.picture };
        const accessToken = await jwtHelper.generateToken(payload, accessTokenSecret, accessTokenLife);
        const refreshToken = await jwtHelper.generateToken(payload, refreshTokenSecret, refreshTokenLife);
        tokenList[refreshToken] = { accessToken, refreshToken };
        return res.status(200).json({ accessToken, refreshToken, ...payload });
      }
      else {
        let payload = { id: user.id, email: user.email, name: user.name, created_at: user.created_at, account_type: user.account_type, avatar: user.avatar };
        const accessToken = await jwtHelper.generateToken(payload, accessTokenSecret, accessTokenLife);
        const refreshToken = await jwtHelper.generateToken(payload, refreshTokenSecret, refreshTokenLife);
        tokenList[refreshToken] = { accessToken, refreshToken };

        return res.status(200).json({ accessToken, refreshToken, ...payload });
      }
    }
    return res.status(401).json({ message: "invalid credentials" });
  }
  else {
    const result = await axios.get(`https://graph.facebook.com/${req.body.userId}?fields=id,name,picture&access_token=${req.body.tokenId}`);

    const data = await result.data;

    //console.log(result);

    if (!data.error) {
      let user = users[_.findIndex(users, { email: data.email, account_type: 2 })]
      if (!user) {
        await accountModel.create({ name: data.name, email: data.id, created_at: req.body.created_at, account_type: 2, avatar: data.picture.data.url });

        let payload = { id: users[users.length - 1].id + 1, email: data.email, name: data.name, created_at: req.body.created_at, account_type: 2, avatar: data.picture.data.url };
        const accessToken = await jwtHelper.generateToken(payload, accessTokenSecret, accessTokenLife);
        const refreshToken = await jwtHelper.generateToken(payload, refreshTokenSecret, refreshTokenLife);
        tokenList[refreshToken] = { accessToken, refreshToken };
        return res.status(200).json({ accessToken, refreshToken, ...payload });
      }
      else {
        let payload = { id: user.id, email: user.email, name: user.name, created_at: user.created_at, account_type: user.account_type, avatar: user.avatar };
        const accessToken = await jwtHelper.generateToken(payload, accessTokenSecret, accessTokenLife);
        const refreshToken = await jwtHelper.generateToken(payload, refreshTokenSecret, refreshTokenLife);
        tokenList[refreshToken] = { accessToken, refreshToken };

        return res.status(200).json({ accessToken, refreshToken, ...payload });
      }
    }
    return res.status(401).json({ message: "invalid credentials" });
  }
})


accountRoute.post("/register", async function (req, res) {
  const users = await accountModel.findAll()
  var user = users[_.findIndex(users, { email: req.body.email })];
  if (user) {
    return res.status(401).json({ message: "Account alrealy existed" });
  }
  const hashPassword = await bcrypt.hash(req.body.password, saltRound);

  const data = {
    email: req.body.email || "",
    name: req.body.username || "",
    created_at: req.body.created_at || "",
    password: hashPassword,
    point: 0,
    account_type: 1
  }
  console.log(data);
  try {
    const result = await accountModel.create(data);
    return res.status(200).json({ message: "Create account sucessfully" });
  }
  catch (err) {
    return res.send(err);
  }
})

module.exports = accountRoute;