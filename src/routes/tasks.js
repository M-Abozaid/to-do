const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isLoggedIn = require("../middlewares/auth/isLoggedIn");
const Joi = require("joi");
const to = require("../to");
const Task = require("../models/task");
const List = require("../models/list");

const joiTaskSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
  urgency: Joi.string().valid(["High", "Moderate", "Low"]),
  isComplete: Joi.boolean(),
  // list id
  list: Joi.string()
});

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * get tasks created by the current user
 */
async function getTasks(req, res, next) {
  let [err, tasks] = await to(Task.find({ creator: req.user._id }));

  if (err) {
    return next(err);
  }

  return res.status(200).json(tasks);
}

async function createTask(req, res, next) {
  let err, list, listId;

  // check if the list exists
  if (req.body.list) {
    // cast req.body.list string to objectId
    try {
      listId = mongoose.Types.ObjectId(req.body.list);
    } catch (error) {
      error.status = 400;
      return next(error);
    }
    [err, list] = await to(List.findById(listId));

    if (err) {
      return next(err);
    }
    if (!list) {
      return res.status(400).json({ error: "There is no list with this id" });
    }
  }

  let validationResults = joiTaskSchema.validate(req.body);

  if (validationResults.error) {
    return res.status(400).json({ error: validationResults.error.message });
  }
  // set the task creator to the current user
  req.body.creator = req.user._id;

  let task = new Task(req.body);
  // return only tasks created by the current user
  [err, task] = await to(task.save());

  if (err) {
    return next(err);
  }

  if (list) {
    list.tasks.push(task._id);
    [err, list] = await to(list.save());
    if (err) {
      return next(err);
    }
  }

  req.user.tasks.push(task._id);
  [err, req.user] = await to(req.user.save());
  if (err) {
    return next(err);
  }

  return res.status(200).json(task);
}

async function getTask(req, res, next) {
  let id = req.params.id;

  let [err, task] = await to(Task.findOne({ _id: id, creator: req.user._id }));

  if (err) {
    return next(err);
  }
  if (!task) {
    return res.status(404);
  }

  res.status(200).json(task);
}

// mark a task as complete
async function completeTask(req, res, next) {
  let id = req.params.id;

  let [err, task] = await to(Task.findOne({ _id: id, creator: req.user._id }));

  if (err) {
    return next(err);
  }
  if (!task) {
    return res.status(404);
  }

  task.isComplete = true;
  task.completedAt = new Date();
  [err, task] = await to(task.save());

  if (err) {
    return next(err);
  }

  res.status(200).json(task);
}

router
  .use(isLoggedIn)
  .get("/", getTasks)
  .post("/", createTask)
  .get("/:id", getTask)
  .post("/:id/complete", completeTask);

module.exports = router;
