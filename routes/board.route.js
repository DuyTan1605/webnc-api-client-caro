const express = require('express');
const router = express.Router();
const boardModel = require("../model/board.model");
const _ = require("lodash");
var helpers = require("../public/helpers/helpers")
// get board infomation
router.get('/', (req, res, next) => {
    boardModel.all().then(boards=>{
        // const myBoard = _.filter(boards,{created_by:parseInt(req.user[0].id)});
        // const otherBoard = _.xor(boards,myBoard);

        res.status(200).json(boards);
    })
    .catch(err=>{
        console.log(err)
        res.status(400).json(err);
    })
});

router.post('/add', (req, res, next) => {
    console.log(req.user);
    console.log(req.body);
    const entity = {
        name: req.body.boardName,
        created_by: parseInt(req.user[0].id),
        created_at: helpers.getDate(),
        time_for_one_step: req.body.timeOneStep,
        password: req.body.password == ""? null : req.body.password
    }
    boardModel.add(entity)
    .then(async (board)=>{
       // console.log(board);
        const boards =  await boardModel.all();
        // const myBoard = _.filter(boards,{created_by:parseInt(req.user[0].id)});
        // const otherBoard = _.xor(boards,myBoard);
        //console.log(boards);
        res.status(200).json(
           boards
        );
    })
    .catch(err=>{
        console.log(err);
        res.status(400).json({
           err
        });
    })
});

module.exports = router;