var express = require('express');
var userModel = require('../model/user.model');
var passport = require('passport');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var router = express.Router();
var passport = require('passport');
var config = require("../config");
//var config = require('../config.js');
var helpers = require("../public/helpers/helpers")
const { cloudinary } = require('../utils/cloudinary');

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dreamleage2000@gmail.com',
    pass: '0949844063'
  }
});


// test loading database
router.post('/', (req, res, next) => {
    userModel.all().then(rows => {
        res.status(200).json({
            message: 'Connect database successful',
            rows:rows   
        });
    }).catch(err => {
        res.status(400).json({
            message: 'Connect database fail'
        });
    });
});



// register a new user
router.post('/register', async (req, res, next) => {

    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;

   //console.log(req.body);
    // check params
    if (!name || !password || !email ) {
        res.status(400).json({
            message: 'Vui lòng nhập đầy đủ thông tin'
        });
        
    }
    else {
        
        // hash password
        var saltRounds = 10;
        var hash = bcrypt.hashSync(password, saltRounds);

        // create an entity
        var entity = {
            name: name,
            password: hash,
            email: email,
            point: 0,
            created_at: helpers.getDate(),
            account_type: 1,
            activate: 0
        }
       
        const result=await userModel.checkExisted({key:"email",value:email});

         if(result.length)
         {
            res.status(400).json({
                message: "Email đã tồn tại"
            });
         }
       else{

            const token = jwt.sign(JSON.stringify({name,email,password}), 'caro_client'); 
      
            var mailOptions = {
                from: 'caro@gmail.com',
                to: email,
                subject: 'Verification account by email',
                html: `<h1>Welcome Caro !Click Link to activate your account</h1>
                <a>${config["client-domain"]}activate/${token}</a>`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                 // res.status(400).json({message:error})
                } else {
                   // res.status(200).json({message:"Sent email"})
                  console.log('Email sent: ' + info.response);
                }
              });

            userModel.add(entity).then(id => {
                res.status(200).json({
                    message: "Tạo tài khoản thành công, truy cập email để kịch hoạt tài khoản"
                });
            }).catch(err => {

                var errMessage = err.code;

                switch (err.code) {
                    case 'ER_DUP_ENTRY':
                        errMessage = 'Email đã tồn tại';
                        break;
                }

                res.status(400).json({
                    message: errMessage
                });
            })
        }
    }
});

// login with username & password
router.post('/login', (req, res, next) => {

    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            return res.status(400).json({
                message: info.message,
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                console.log(err);
                res.status(400).json({
                    message: err
                });
            }
            console.log(user);
            // generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign(JSON.stringify(user), 'caro_client');
            return res.json({
                user,
                token
            });
        });
    })(req, res);
});

//facebook login
router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/login/facebook/callback', passport.authenticate('facebook', {
    session: false,
    failureRedirect: config['client-domain'] + 'login/',
}), (req, res) => {
    const token = jwt.sign(JSON.stringify(req.user), 'caro_client');
    console.log(req.user);
    res.redirect(config['client-domain'] + 'login?token=' + token + '#caro_client');
});

// // google login
router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/login/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: config['client-domain'] + 'login/',
}), (req, res) => {
    console.log(req.user);
    const token = jwt.sign(JSON.stringify(req.user), 'caro_client');
    res.redirect(config['client-domain'] + 'login?token=' + token + '#caro_client');
});

router.post('/forgot',async (req,res,next)=>{
    console.log("Req body: ",req.body);
    const result = await userModel.checkExisted({key:"email",value:req.body.email});
    if(result[0])
    {
        const token = jwt.sign(JSON.stringify({email:req.body.email}), 'caro_client');

        var mailOptions = {
            from: 'caro@gmail.com',
            to: req.body.email,
            subject: 'Reset password by email',
            html: `<h1>Welcome Caro !Click Link to reset your password</h1>
            <a>${config["client-domain"]}reset/${token}</a>`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
             res.status(400).json({message:error})
            } else {
               res.status(200).json({message:"Truy cập email để lấy mã rest"})
              console.log('Email sent: ' + info.response);
            }
          });
    }
    else{
        res.status(400).json({message:"Tài khoản không tồn tại"})
    }
})

router.post('/changePassword', passport.authenticate('jwt', {
    session: false
  }),async (req,res,next)=>{
    const saltRounds = 10;
    const hash = bcrypt.hashSync(req.body.password, saltRounds);
    userModel.update("id",{id:req.user[0].id,password:hash})
    .then(user=>{
        res.status(200).json({message:"Đổi mật khẩu thành công"})
    })
    .catch(err=>{
        res.status(400).json({message:"Đổi mật khẩu không thành công"})
    })
})


// register a new user
router.post('/changeinfo', passport.authenticate('jwt', {session: false}),(req, res, next) => {

    var name = req.body.name;
    var email = req.body.email;
    var avatar = req.body.avatar;
    var avatarLink = null;
        userModel.checkExisted({key:'email',value:email}).then( async rows => {
            if (rows.length && rows[0].id != req.user[0].id) {
                return res.status(400).json({
                    message: 'Email đã tồn tại'
                });
            }
            //var user = rows[0];

            // update basic info
            var entity = {
                id: req.user[0].id,
                name: name,
                email: email,
            }
            if(avatar)
            {
                console.log(avatar)
                try {
                    const fileStr = avatar;
                    const uniqueFilename = new Date().toISOString()
                    const uploadResponse = await cloudinary.uploader.upload(fileStr, 
                    { public_id: `caro/${uniqueFilename}`, tags: `caro` });
                    entity.avatar = uploadResponse.url;
                   //res.json({ msg: 'yaya' });
                } catch (err) {
                    console.error(err);
                   // res.status(500).json({ err: 'Something went wrong' });
                }
             }

            // write to database
            userModel.update("id",entity).then(id => {
                const newInfo = {...req.user[0], name: name,email: email};
                return res.status(200).json({
                    message: 'Cập nhật thông tin thành công',
                    userInfo: newInfo,
                    token: jwt.sign(JSON.stringify(newInfo),"caro_client")
                });
            }).catch(err => {
                return res.status(400).json({
                    message: 'Đã xảy ra lỗi, vui lòng thử lại'
                });
            })
            
        }).catch(err => {
            return res.status(400).json({
                message: 'Đã xảy ra lỗi, vui lòng thử lại'
            });
        })
});

router.post('/changePasswordFromProfile', passport.authenticate('jwt', {session: false}), (req, res, next) => {

        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;

        userModel.get({key:'id',value:req.user[0].id}).then(rows => {
            if (!bcrypt.compareSync(oldPassword, rows[0].password)) {
                return res.status(400).json({
                    message: 'Mật khẩu cũ không chính xác'
                });
            }
            //var user = rows[0];

            // update basic info
            var entity = {
                id: req.user[0].id,
                password: bcrypt.hashSync(newPassword, 10)
            }

            // write to database
            userModel.update("id",entity).then(id => {
                return res.status(200).json({
                    message: 'Cập nhật mật khẩu thành công'
                });
            }).catch(err => {
                return res.status(400).json({
                    message: 'Đã xảy ra lỗi, vui lòng thử lại'
                });
            })
            
        }).catch(err => {
            return res.status(400).json({
                message: 'Đã xảy ra lỗi, vui lòng thử lại'
            });
        })
});


module.exports = router;