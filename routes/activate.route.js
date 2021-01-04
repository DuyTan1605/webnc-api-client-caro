var express = require('express');
var router = express.Router();
const userModel = require("../model/user.model");

// get infomation
router.get('/:id', (req, res, next) => {
    console.log(req.params);
    console.log(req.user);
    res.send("OK")
});

module.exports = router;