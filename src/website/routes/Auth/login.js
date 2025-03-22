const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/login', passport.authenticate('discord', { failureRedirect: "/" }), async function(req, res) {
    if(!req.user.id || ! req.user.guilds) {
        res.redirect('/');
        return;
    } else res.redirect('/');
});

module.exports = router;