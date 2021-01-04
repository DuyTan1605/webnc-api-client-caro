var express = require('express');
var router = express.Router();
const userModel = require("../model/user.model");

// get infomation
router.get('/profile', (req, res, next) => {
    console.log(req.user)
    if (req.user.length > 0) {
        const user = req.user[0];
        const info = {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at : user.created_at,
            point: user.point,
            account_type: user.account_type,
            avatar: user.avatar,
            activate: user.activate,
            rank: user.rank,
            total_match: user.total_match,
            percent_win: user.percent_win,
        }
        console.log("Infor: ",info)
        res.status(200).json(info);
    }
    else {
        res.status(400).json({
            message: 'Đã xảy ra lỗi, vui lòng thử lại'
        })
    }
});

router.post('/activate/:id', async (req, res, next) => {
    //console.log("Req user:",req.user)
    const result = await userModel.checkExisted({key:'email',value:req.user[0].email});
   //console.log(result[0]);
    
    if(result[0].activate ==1)
    {
        res.status(200).json({message:'Tài khoản đã kích hoạt'});
    }
    else{
        userModel.update('email',{email:req.user[0].email,activate:1})
        .then(user=>{
            res.status(200).json({message:'Kịch hoạt tài khoản thành công'});
        })
        .catch(err=>{
            res.status(400).json({
                message: err.message
            });
        })
    }
});



module.exports = router;