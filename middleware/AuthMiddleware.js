const jwtHelper = require("../public/helpers/jwtHelper");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

let isAuth = async (req, res, next) => {
    const tokenFromClient = req.body.token || req.query.token || req.headers["x-access-token"];
    if (tokenFromClient) {
        try {
            const decoded = await jwtHelper.verifyToken(tokenFromClient, accessTokenSecret);
            req.jwtDecoded = decoded;
            next();
        }
        catch (err) {
            return res.status(401).json({
                messages: 'Unauthorized.'
            })
        }
    }
    else {
        return res.status(403).send({
            messages: 'No token provided'
        });
    }
}

module.exports = {
    isAuth: isAuth
}