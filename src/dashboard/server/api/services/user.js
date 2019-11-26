const { createHash } = require('crypto')

const config = require('config')
const jwt = require('jsonwebtoken')

const Service = require('./service')

const sign = config.get('sign')
const masterToken = config.get('masterToken')
const addGroupLink = config.get('AddGroupLink')
const WikiLink = config.get('WikiLink')

class User extends Service {
  /**
   * @param {import('koa').Context} context
   * @param {string} email
   */
  constructor (context, email) {
    super(context)
    this.email = email
  }

  /**
   * @param {import('koa').Context} context
   * @param {object} idToken
   * @return {User}
   */
  static fromIdToken (context, idToken) {
    const user = new User(context, idToken['upn'])
    user.givenName = idToken['given_name']
    user.addGroupLink = addGroupLink
    user.familyName = idToken['family_name']
    user.WikiLink = WikiLink
    return user
  }

  /**
   * @param {import('koa').Context} context
   * @param {string} email
   * @param {string} token
   * @return {User}
   */
  static fromToken (context, email, token) {
    const user = new User(context, email)
    const expectedToken = user.token
    const actualToken = Buffer.from(token, 'hex')
    context.assert(expectedToken.equals(actualToken), 403, 'Invalid token')

    return user // No givenName nor familyName here
  }

  /**
   * @param {import('koa').Context} context
   * @param {string} token
   * @return {User}
   */
  static fromCookie (context, token) {
    const payload = jwt.verify(token, sign)
    const user = new User(context, payload['email'])
    user.password = this.generateToken(user.email)
    user.givenName = payload['givenName']
    user.addGroupLink = addGroupLink
    user.WikiLink = WikiLink
    user.familyName = payload['familyName']
    user.uid = payload['uid']
    user.gid = payload['gid']
    return user
  }

  /**
   * @param {string} email
   * @return {Buffer}
   */
  static generateToken (email) {
    const hash = createHash('md5')
    hash.update(`${email}:${masterToken}`)
    return hash.digest()
  }

  get token () {
    if (this._token == null) {
      Object.defineProperty(this, '_token', {
        value: User.generateToken(this.email)
      })
    }
    return this._token
  }

  /**
   * @return {string}
   */
  toCookie () {
    return jwt.sign({
      email: this.email,
      uid: this.uid,
      gid: this.gid,
      _token: this.token,
      familyName: this.familyName,
      givenName: this.givenName,
      addGroupLink: addGroupLink,
      WikiLink: WikiLink
    }, sign)
  }
}

module.exports = User
