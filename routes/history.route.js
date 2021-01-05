const express = require('express');
const router = express.Router();
const historyModel = require("../model/history.model");
const userModel = require("../model/user.model");
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

router.post('/add', async (req, res, next) => {
  //  console.log(req.user);
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
            });
    })
        .catch(err=>{
            console.log(err);
            res.status(400).json({
            err
            });
    })

    if(req.body.type == "normal" || req.body.type == "surrender")
    {
        let winnerUser = (await userModel.get({ key: "id", value:req.body.winner }))[0];
        let loserUser = (await userModel.get({ key: "id", value:req.body.loser }))[0];
        
        let newPointWinner = (winnerUser.point < loserUser.point) ? (winnerUser.point+2) : (winnerUser.point+1);

        let newDataWinnerUser = {
            id: winnerUser.id,
            point: newPointWinner,
            total_match : winnerUser.total_match + 1,
            percent_win : parseFloat(winnerUser.total_win + 1)/(winnerUser.total_match + 1),
            total_win: winnerUser.total_win + 1,
            rank: helpers.getRank(newPointWinner),
        } 
        console.log(newDataWinnerUser);
        await userModel.update("id",newDataWinnerUser);

        let newPointLoser = (loserUser.point > winnerUser.point) ? (loserUser.point - 2) : (loserUser.point - 1);
        newPointLoser = newPointLoser >=0 ? newPointLoser : 0;
        let newDataLoserUser = {
            id: loserUser.id,
            point: newPointLoser,
            total_match : loserUser.total_match + 1,
            rank: helpers.getRank(newPointLoser),
            percent_win : parseFloat(loserUser.total_win)/(loserUser.total_match + 1)
        }
        console.log(newDataLoserUser);
       await userModel.update("id",newDataLoserUser);
    }
    if(req.body.type == "draw")
    {
        let winnerUser = (await userModel.get({ key: "id", value:req.body.winner }))[0];
        let loserUser = (await userModel.get({ key: "id", value:req.body.loser }))[0];

        let newDataWinnerUser = {
            id: winnerUser.id,
            total_match : winnerUser.total_match + 1,
            percent_win : parseFloat(winnerUser.total_win)/(winnerUser.total_match + 1)
        } 

        console.log(newDataWinnerUser);
        await userModel.update("id",newDataWinnerUser);

        let newDataLoserUser = {
            id: loserUser.id,
            total_match : loserUser.total_match + 1,
            percent_win : parseFloat(loserUser.total_win)/(loserUser.total_match + 1)
        } 

        console.log(newDataLoserUser);
        await userModel.update("id",newDataLoserUser);
    }
    

});

module.exports = router;