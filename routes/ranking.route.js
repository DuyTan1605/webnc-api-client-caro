var express = require('express');
var router = express.Router();
const userModel = require("../model/user.model");

// get ranking infomation
router.get('/', async (req, res, next) => {
   
    try{
        const rankingInfo = await userModel.getAllWithOrder("point","DESC");
        res.status(200).json(rankingInfo);
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json({
            message: "Error! Please try again"
        });
    }

    
});





module.exports = router;