const BaseDAO = require('./BaseDAO')
const { ref } = require('objection')

class UserDAO extends BaseDAO {
  static get tableName () {
    return 'users'
  }

  static get jsonAttributes () {
    return ['tokenRefresh']
  }

  /**
   * ------------------------------
   * @HOOKS
   * ------------------------------
   */
  $formatJson (json) {
    json = super.$formatJson(json)

    if (json.tokens && Object.keys(json.tokens).length) {
      json.tokens = JSON.parse(json.tokens)
    }

    delete json.passwordHash
    delete json.tokenRefresh
    delete json.tokenReset
    delete json.avatar

    return json
  }

  /**
   * ------------------------------
   * @METHODS
   * ------------------------------
   */

  static GetByEmail (email) {
    __typecheck(email, 'String', true)

    return this.query().where({ email }).first()
      .then(data => {
        if (!data) throw this.errorEmptyResponse()
        return data
      }).catch(error => { throw error })
  }

  static GetRefreshTokensByUserId (id) {
    __typecheck(id, 'Number', true)

    return this.query()
      .findById(id)
      .select(ref(`${this.tableName}.tokenRefresh`)
      .castText()
      .as('tokens'))
      .then(data => {
        if (!data) throw this.errorEmptyResponse()
        return data
      }).catch(error => { throw error })
  }
  /**
   * add new prop to 'tokenRefresh' jsonb field
   * prop name === Initialization Vector (taken from REFRESH TOKEN body)
   * store to this prop REFRESH TOKEN
   */
  static AddRefreshTokenByUserId (id, data) {
    __typecheck(id, 'Number', true)
    __typecheck(data, 'Object', true)
    __typecheck(data.iv, 'String', true)
    __typecheck(data.token, 'String', true)

    return this.query()
      .findById(id)
      .patch({ [`tokenRefresh:${data.iv}`]: data.token })
  }

  static ClearRefreshTokensListByUserId (id) {
    __typecheck(id, 'Number', true)

    return this.query().findById(id).patch({})
  }

  static AddRefreshToken (data) {
    __typecheck(data, 'Object', true)

    return this.query().patchAndFetchById(data)
  }
}

module.exports = UserDAO
