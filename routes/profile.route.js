var express = require('express');
var router = express.Router();

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
            avatar: user.avatar
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

module.exports = router;