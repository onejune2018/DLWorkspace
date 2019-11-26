const axiosist = require('axiosist')
const nock = require('nock')
const _ = require('lodash')

const User = require('../../../api/services/user')
const api = require('../../../api').callback()

const userParams = {
  email: 'dlts@example.com',
  token: User.generateToken('dlts@example.com').toString('hex')
}

describe('POST /clusters/:clusterid/jobs', () => {
  it('should response returning messages if job POST succeeded', async () => {
    nock('http://universe')
      .post('/PostJob')
      .reply(200, {
        message: 'job adding succeeded'
      })

    const response = await axiosist(api).post('/clusters/Universe/jobs',
      { vcName: 'test' }, { params: userParams })

    response.status.should.equal(200)
    response.data.should.have.property('message', 'job adding succeeded')
  })
  it('should response returning messages if job POST succeeded', async () => {
    nock('http://universe')
      .post('/PostJob')
      .reply(200, {
        message: 'job adding succeeded'
      })

    const response = await axiosist(api).post('/clusters/Universe/jobs',
      { vcName: 'test', team: null }, { params: userParams })

    response.status.should.equal(200)
    response.data.should.have.property('message', 'job adding succeeded')
  })
  it('should response 400 Bad Request if job schema is invalid', async () => {
    const response = await axiosist(api).post('/clusters/Universe/jobs',
      {}, { params: userParams })
    response.status.should.equal(400)
  })

  it('should forcely set userName as current user in the submitted job', async () => {
    nock('http://universe')
      .post('/PostJob', _.matches({ userName: 'dlts@example.com' }))
      .reply(200, {
        message: 'job adding succeeded'
      })

    const response = await axiosist(api).post('/clusters/Universe/jobs',
      { vcName: 'test', userName: 'foo' }, { params: userParams })
    response.status.should.equal(200)
  })
})
