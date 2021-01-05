const express = require('express');
const router = express.Router();
const historyModel = require("../model/history.model");
const _ = require("lodash");
var helpers = require("../public/helpers/helpers")
// get history infomation
// router.get('/', (req, res, next) => {
//     historyModel.all().then(historys=>{
//         // const myhistory = _.filter(historys,{created_by:parseInt(req.user[0].id)});
//         // const otherhistory = _.xor(historys,myhistory);

//         res.status(200).json(historys);
//     })
//     .catch(err=>{
//         console.log(err)
//         res.status(400).json(err);
//     })
// });

router.post('/add', (req, res, next) => {
    console.log(req.user);
    console.log(req.body);
    const entity = {
        board: req.body.board,
        winner: req.body.winner,
        loser: req.body.loser,
        data: JSON.stringify(req.body.data),
        chat: JSON.stringify(req.body.chat),
        type: req.body.type
    }
    historyModel.add(entity)
    .then((history)=>{
        res.status(200).json({
        message: "Add history successfully"
        }
        );
    })
    .catch(err=>{
        console.log(err);
        res.status(400).json({
        err
        });
    })
    // if(req.body.type == 'normal')
    // {
       
    // }
    // if(req.body.type == "surrender")
    // {

    // }
});

module.exports = router;