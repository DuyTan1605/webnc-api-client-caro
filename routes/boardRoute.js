const express = require('express');
const { includes } = require('lodash');
const boardRoute = express.Router();
const _ = require("lodash");
const { async } = require('q');
const {isAuth} = require("../middleware/AuthMiddleware");
const { boards: boardModel } = require("../models/index");
const { users: userModel } = require("../models/index");

boardRoute.get("/loadAllBoard",async function(req,res)
{
    //userModel.hasMany(boardModel, {foreignKey: 'created_by'})
    boardModel.belongsTo(userModel,{foreignKey: 'created_by', targetKey: 'id'})
    const boards = await boardModel.findAll(
      {
      include:[
        {
        model: userModel,
        attributes: ["name"]
        }
      ]
    }
    );
      
    console.log(boards);
    return res.status(200).json({message:'Load board succesfully',boards:boards});
})

boardRoute.post("/addNewBoard",isAuth,async function(req,res)
{
    try {
        const data ={
            name: req.body.boardName,
            created_by: req.jwtDecoded.data.id,
        }
        console.log(data);
        await boardModel.create(data);
        boardModel.belongsTo(userModel,{foreignKey: 'created_by', targetKey: 'id'})
        const result = await boardModel.findAll(
          {
          include:[
            {
            model: userModel,
            attributes: ["name"]
            }
          ]
        }
        );
        // console.log(result);
        return res.status(200).json({ message: "Create account sucessfully",boards:[] });
      }
      catch (err) {
        return res.send(err);
      }
})
module.exports = boardRoute;