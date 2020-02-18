const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

let TOKEN;

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
    try {
        const { username, password } = req.body;
        if (await User.authenticate(username, password)) {
            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({ token });
        } else {
            throw new ExpressError("Invalid user/password", 400);
        }
    }
    catch (err) {
        return next(err)
    }
});


router.get("/register", async function (req, res, next) {
    return res.render('register.html')
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


router.post("/register", async function (req, res, next) {
    try {
        let { username } = await User.register(req.body)
        TOKEN = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.render('messages.html');
    }

    catch (err) {
        return next(err)
    }
});

module.exports = router;
exports.variableName = TOKEN;