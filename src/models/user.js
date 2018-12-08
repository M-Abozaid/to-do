const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const User = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  lists: [{ type: Schema.Types.ObjectId, ref: 'List' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]

}, {timestamps: true})

// --- using the email instead of the user name for login
User.plugin(passportLocalMongoose, {usernameField: 'email'})

module.exports = mongoose.model('User', User)
