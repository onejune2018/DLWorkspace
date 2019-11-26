const axiosist = require('axiosist')
const User = require('../../api/services/user')
const api = require('../../api').callback()

const userParams = {
  email: 'dlts@example.com',
  token: User.generateToken('dlts@example.com').toString('hex')
}

describe('GET /user', () => {
  it('should response user token', async () => {
    const response = await axiosist(api).get('/user', {
      params: userParams
    })
    response.data.should.have.property('token', `${userParams.token}`)
  })
})
