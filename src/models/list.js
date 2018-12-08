const mongoose = require('mongoose')
const Schema = mongoose.Schema

const List = new Schema({
  name: {
    type: String,
    required: true
  },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  creator: { type: Schema.Types.ObjectId, ref: 'User' }

}, {timestamps: true})

module.exports = mongoose.model('List', List)
