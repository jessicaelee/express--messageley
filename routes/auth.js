const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


router.post("/register", async function (req, res, next) {
    console.log("*******")

    try {
        let { username } = await User.register(req.body)
        let token =
            let user = await User.register(req.body.username, req.body.password, req.body.first_name, req.body.last_name, req.body.phone)
        return user
    } catch (err) {
        next(err)
    }
})

module.exports = router;