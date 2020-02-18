
const Router = require("express").Router;
const router = new Router();

const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");
const ExpressError = require("../expressError");
const TOKEN = require("./auth")
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    let result = await Messages.get(req.params.id);
    if (req.user.username !== result.from_user.username || req.user.username !== result.to_user.username) {
      throw new ExpressError("Invalid user", 400);
    } return res.json({ message: result });
  }
  catch (err) {
    return next(err)
  }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    let { message } = await Message.create(req.body);
    return res.json({ message: message });

  } catch (err) {
    return next(err)
  }
});



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  try {
    let result = await Messages.get(req.params.id);
    if (req.user.username === result.to_user.username) {
      let readMsg = await Message.markRead(req.params.id);
      return res.json({ message: readMsg });
    } else {
      throw new ExpressError("Invalid User", 400);
    }
  } catch (err) {
    return next(err)
  }
});

module.exports = router;