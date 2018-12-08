var express = require("express");
var router = express.Router();
const Joi = require("joi");
const to = require("../to");

const isLoggedIn = require("../middlewares/auth/isLoggedIn");
const List = require("../models/list");
const joiListSchema = Joi.object().keys({
  name: Joi.string()

    .min(3)
    .max(30)
    .required()
});

router.use(isLoggedIn);
router.get("/", async function(req, res, next) {
  // return only lists created by the current user
  let [err, lists] = await to(List.find({ creator: req.user._id }));

  if (err) {
    return next(err);
  }

  return res.status(200).json(lists);
});

router.post("/", async function(req, res, next) {
  let err, list;
  let validationResults = joiListSchema.validate(req.body);

  if (validationResults.error) {
    return res.status(400).json({ error: validationResults.error.message });
  }

  req.body.creator = req.user._id;

  // set the task creator to the current user
  req.body.creator = req.user._id;

  list = new List(req.body);
  // return only lists created by the current user
  [err, list] = await to(list.save());

  req.user.lists.push(list._id);
  [err, req.user] = await to(req.user.save());
  if (err) {
    return next(err);
  }

  if (err) {
    return next(err);
  }

  return res.status(200).json(list);
});

router.get("/:id", async function(req, res, next) {
  // return only tasks created by the current user
  let [err, list] = await to(
    List.findOne({ creator: req.user._id }).populate("tasks")
  );

  if (err) {
    return next(err);
  }

  return res.status(200).json(list);
});

module.exports = router;
