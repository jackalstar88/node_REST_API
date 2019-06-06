const BaseDAO = require('../core/BaseDAO')

class UserDAO extends BaseDAO {
  static get tableName () {
    return 'users'
  }

  static get jsonAttributes () {
    return ['refreshTokensMap']
  }

  static get relationMappings () {
    return {
      posts: {
        relation: BaseDAO.HasManyRelation,
        modelClass: `${__dirname}/PostDAO`,
        join: {
          from: 'users.id',
          to: 'posts.userId'
        }
      }
    }
  }

  /**
   * ------------------------------
   * @HOOKS
   * ------------------------------
   */
  $formatJson (json) {
    json = super.$formatJson(json)

    delete json.passwordHash
    delete json.tokenReset
    delete json.avatar

    return json
  }

  /**
   * ------------------------------
   * @METHODS
   * ------------------------------
   */

  static Create (data) {
    __typecheck(data, __type.object, true)
    __typecheck(data.passwordHash, __type.string, true, 'Invalid \'passwordHash\' field')

    return this.query().insert(data)
  };

  static getByEmail (email) {
    __typecheck(email, __type.string, true)

    return this.query().where({ email }).first()
      .then(data => {
        if (!data) throw this.errorEmptyResponse()
        return data
      }).catch(error => { throw error })
  }

  /**
   * @description check email availability in DB.
   * @param email
   * @returns {Promise<boolean>}
   */
  static IsEmailExist (email) {
    __typecheck(email, __type.string, true)

    return this.query().where({ email }).first()
      .then(data => Boolean(data))
      .catch(error => { throw error })
  }
}

module.exports = UserDAO
