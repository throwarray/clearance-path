const path = require('path');
const pkg = require('./package.json');

function o (...a) {
    return Object.assign(Object.create(null), ...a);
}

module.exports = function (env) {
    const DEFAULTS = {
        host: 'localhost',
        port: 3000,
        compress: true,
        version: pkg.version,
        historyAPIfallback: {},
        contentBase: [
            path.join(__dirname, './server/static'),
            path.join(__dirname, './server/dist')
        ]
    };

    const SETTINGS = o(DEFAULTS, {
        development: o(DEFAULTS, {
            db: 'mongodb://localhost/app-development',
            log: {
                path: path.join(__dirname, './server/access-development.log')
            }
        }),
        production: o(DEFAULTS, {
            db: 'mongodb://localhost/app-production',
            log: {
                path: path.join(__dirname, './server/access.log')
            }
        })
    });

    return SETTINGS[env];
};
