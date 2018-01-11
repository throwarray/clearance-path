const express = require('express');
const compress = require('compression');
const history = require('connect-history-api-fallback');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const favicon = require('serve-favicon');
// const bodyParser = require('body-parser');

module.exports = function (app, env, settings, isWebpack) {
    // Handle bodies for specific routes

    // const accept_urlencoded = bodyParser.urlencoded({
    //     extended: false,
    //     limit: '100kb'
    // });
    //
    // const accept_json = bodyParser.json({
    //     limit: '100kb'
    // });
    //

    app.use(favicon(path.join(__dirname, './static/favicon.ico')));

    // Logs access to disk
    if (settings.log) {
        let logPath = path.join(__dirname, 'access.log');

        const stream =  fs.createWriteStream(
            settings.log.path || logPath, {
                flags: 'a'
            }
        );

        app.use(morgan('combined', { stream }));
    }

    app.use(function onerror(err, req, res, next) {
        next(err);
    });

    if (settings.compress) {
        app.use(compress());
    }

    if (settings.historyAPIfallback) {
        app.use(history(settings.historyAPIfallback));
    }

    // Already added from webpack-config.js
    if (!isWebpack) {
        for (let i = 0; i < settings.contentBase.length; i++) {
            const base = settings.contentBase[i];
            app.use(express.static(base));
        }
    }
};
