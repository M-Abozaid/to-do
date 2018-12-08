process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
let app = require('../src/app')
let should = chai.should()

let Mongoose = require('mongoose').Mongoose
let mongoose = new Mongoose()

let Mockgoose = require('mockgoose').Mockgoose
let mockgoose = new Mockgoose(mongoose)
let Task = require('../src/models/task')
let User = require('../src/models/user')

const testUser = {
  'name': 'Muhammed',
  'email': 'aa@abc.de',
  'password': '123'
}

chai.use(chaiHttp)
var agent = chai.request.agent(app)
before(function (done) {
  mockgoose.prepareStorage().then(function () {
    mongoose.connect('mongodb://localhost/todo-test', function (err) {
      User.remove({}, (err) => {
        agent
          .post('/users/register')
          .send(testUser)
          .end((err, res) => {
            console.log(res.status)
            res.should.have.status(200)
            done(err)
          })
      })
    })
  })
})

describe('Task', () => {
  beforeEach((done) => {

    agent
      .post('/users/login')
      .send(testUser)
      .end((err, res) => {
        Task.remove({}, (err) => {
          done()
        })
      })
  })
  describe('/GET tasks', () => {
    it('it should return all tasks', (done) => {

      agent
        .get('/tasks')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)

          done()
        })
    })
  })
  /*
  * Test the /POST route
  */
  describe('/POST task', () => {
    it('it should POST create a new task', (done) => {
      let task = {
        name: 'do something'
      }

      agent
        .post('/tasks')
        .send(task)
        .end((err, res) => {
          console.log(res.body)
          res.should.have.status(200)
          res.body.should.have.property('creator')
          done()
        })
    })
  })

  describe('/POST task', () => {
    it("it should not create a new task when the list is specified but doesn't exist", (done) => {
      let task = {
        name: 'do something',
        list: '5c0b1f6b844e5d7748589bb2'
      }

      agent
        .post('/tasks')
        .send(task)
        .end((err, res) => {
          console.log(res)
          res.should.have.status(400)
          res.body.should.have.property('error')
          done()
        })
    })
  })
})
