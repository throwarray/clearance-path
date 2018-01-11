require('dotenv').load();

const http = require('http');
const express = require('express');
const CONFIG_SERVER = require('./server.cfg.js');
const ENV_SETTINGS = require('../build.cfg.js');

const ENV = process.env.NODE_ENV || 'production';
const SETTINGS = ENV_SETTINGS(ENV);

const app = express();
const server = http.createServer(app);

CONFIG_SERVER(app, ENV, SETTINGS);

server.listen(SETTINGS.port || process.env.PORT || 3000);
