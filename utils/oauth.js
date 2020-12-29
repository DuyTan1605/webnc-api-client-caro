var config = require('../config');

module.exports = {
    'facebookAuth': {
        'clientID': '673687296663444',
        'clientSecret': '124ac723d80ea69a21466e7a7a0f49ce',
        'callbackURL': config['server-domain'] + 'users/login/facebook/callback'
    },
    'googleAuth': {
        'clientID': '1035691293837-1e85bt80b945seuqio2cbk5i19m5759k.apps.googleusercontent.com',
        'clientSecret': 'KwC0Uja8kTvNrTfRFHiY51M2',
        'callbackURL': config['server-domain'] + 'users/login/google/callback'
    }
};