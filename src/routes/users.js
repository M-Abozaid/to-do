const express = require("express");
const passport = require("passport");
const Joi = require("joi");
const to = require("../to");
const User = require("../models/user");
const isLoggedIn = require("../middlewares/auth/isLoggedIn");

const publicProfile = {
  name: -1
};

const joiUserSchema = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  password: Joi.string()
    .min(3)
    .required(),
  email: Joi.string()
    .email()
    .required()
});

const router = express.Router();
router.get("/", async function(req, res, next) {
  let [err, users] = await to(User.find({}, publicProfile));

  if (err) {
    return next(err);
  }

  return res.status(200).json(users);
});

router.get("/:id", isLoggedIn, async function(req, res) {
  let id = req.params.id;
  // query projection
  let project = {};

  // if the request is not coming from the current authenticated user
  // return only public profile
  if (id !== req.user._id.toString()) {
    project = publicProfile;
  }

  let [err, user] = await to(User.findById(req.params.id, project));

  if (err) {
    return next(err);
  }
  if (!user) {
    return res.status(404);
  }

  res.status(200).json(user);
});

router.post("/register", async function(req, res, next) {
  let err, user, count;

  let validationResults = joiUserSchema.validate(req.body);

  if (validationResults.error) {
    return res.status(400).json(validationResults.error);
  }

  // validate email uniqueness
  [err, count] = await to(User.count({ email: req.body.email }));
  if (err) {
    console.log("error Checking email uniqueness", err);
    return next(err);
  }
  if (count > 0) {
    err = {
      message: "Email already exists !",
      name: "ValidationError"
    };
    return res.status(400).json(err);
  }
  // validation finished

  [err, user] = await to(User.register(new User(req.body), req.body.password));
  if (err) {
    console.log("error registering user!", err);
    return next(err);
  }

  passport.authenticate("local")(req, res, function() {
    return res.status(200).json({
      user: { _id: user._id, name: user.name },
      status: "Registration Successful!"
    });
  });
});

router.post("/login", passport.authenticate("local"), function(req, res) {
  res.status(200).json({
    status: "Login successful!",
    success: true
  });
});

router.post("/logout", function(req, res, next) {
  req.logout();
  res.status(200).json({
    status: "Bye!"
  });
});

module.exports = router;
