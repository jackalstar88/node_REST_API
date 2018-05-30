const Joi = require('joi')

const BaseAction = require('../BaseAction')
const UserDAO = require('../../dao/UserDAO')
const registry = require('../../registry')

class UpdateAction extends BaseAction {
  static get accessTag () {
    return 'users:update'
  }

  static get validationRules () {
    return {
      ...this.baseValidationRules,
      body: Joi.object().keys({
        name: Joi.string().min(3).max(50)
      })
    }
  }

  static run (req, res, next) {
    let currentUser = registry.getCurrentUser()

    this.validate(req, this.validationRules)
      .then(() => this.checkAccessByTag(this.accessTag))
      .then(() => UserDAO.UPDATE(currentUser.id, req.body)) // user can update only itself
      .then(updatedModel => res.json({ data: updatedModel, success: true }))
      .catch(error => next(error))
  }
}

module.exports = UpdateAction
