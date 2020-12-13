const express = require('express');
const boardRoute = express.Router();
const _ = require("lodash");
const { async } = require('q');
const {isAuth} = require("../middleware/AuthMiddleware");
const { boards: boardModel } = require("../models/index");

boardRoute.get("/loadAllBoard",async function(req,res)
{
    const boards = await boardModel.findAll();
   
    return res.status(200).json({message:'Load board succesfully',boards:boards});
})

boardRoute.post("/addNewBoard",isAuth,async function(req,res)
{
    try {
        const data ={
            name: req.body.boardName,
            created_by: req.jwtDecoded.data.id
        }
        console.log(data);
        await boardModel.create(data);
        const result = await boardModel.findAll();
        console.log(result);
        return res.status(200).json({ message: "Create account sucessfully",boards:result });
      }
      catch (err) {
        return res.send(err);
      }
})
module.exports = boardRoute;