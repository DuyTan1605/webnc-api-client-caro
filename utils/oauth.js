var config = require('../config');

module.exports = {
    'facebookAuth': {
        'clientID': '673687296663444',
        'clientSecret': '124ac723d80ea69a21466e7a7a0f49ce',
        'callbackURL': config['server-domain'] + 'users/login/facebook/callback'
    },
    'googleAuth': {
        'clientID': '94702749463-04p7t8q8h0s3gnrjjdn3j4dtf4n1dqf3.apps.googleusercontent.com',
        'clientSecret': 'Pw7IhDrZ3yegwi9vKu5T_vcV',
        'callbackURL': config['server-domain'] + 'users/login/google/callback'
    }
};