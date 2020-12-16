const express = require('express');
const historyRoute = express.Router();
const _ = require("lodash");

const { history: historyModel } = require("../models/index");


historyRoute.get("/loadAllHistory",async function(req,res)
{
    console.log(historyModel);
    const histories = await historyModel.findAll();
    return res.status(200).json({message:'Load history succesfully',histories:histories.filter(history=>history.winner==req.query.id || history.loser==req.query.id )});
})

module.exports = historyRoute;