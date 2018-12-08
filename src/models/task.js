const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Task = new Schema({
  name: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['High', 'Moderate', 'Low'],
    default: 'Moderate'
  },
  isComplete: {
    type: Boolean,
    required: true,
    default: false
  },
  completedAt: {
    type: Date
  },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  list: {type: Schema.Types.ObjectId, ref: 'List'}

}, {timestamps: true})

module.exports = mongoose.model('Task', Task)
