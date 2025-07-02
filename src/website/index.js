const express = require('express');
const path = require('path');
const session = require('express-session')
const ejs = require('ejs');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const cors = require('cors');

require('dotenv').config()

const app = express();

async function load (client, connection) {
    app.use(express.json())
    app.use(cors());
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../website/views'));
    app.use(express.static(__dirname + '../website/public'));
    app.use(session({
        secret: "UJrkuM3FmqB1OHVd-qb3lNE3GfAP79-F",
        resave: false,
        saveUninitialized: false
    }))

    app.use(async function(req, res, next) {
        req.client = client;
        req.db = connection;
        next()
    })

    app.use(passport.initialize())
    app.use(passport.session())

    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser((obj, done) => {
        done(null, obj)
    })

    passport.use(new Strategy({
        clientID : client.user.id,
        clientSecret: process.env.SECRET,
        callbackURL: process.env.CALLBACK_URL,
        scope: ['identify', 'email', 'guilds']
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));

    app.get('/', require('./routes/global'));
    app.get('/home', require('./routes/global'));
    app.get('/dashboard', require('./routes/global'));
    app.get('/documentation', require('./routes/global'));

    app.get('/login', require('./routes/Auth/login'));
    app.get('/logout', require('./routes/Auth/logout'));
    
    app.listen(100, () => console.log(`[WEB] `.bold.blue + `Web server has been started.`.bold.white + ` (http://localhost:90/)`.bold.blue ));
}

module.exports = {
    load
}