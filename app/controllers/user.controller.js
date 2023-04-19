const User = require('../models/user.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const user = new User({
    password: req.body.password,
    name: req.body.name,
    full_name: req.body.full_name,
    email: req.body.email,
    role: req.body.role
  })

  User.create(user, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the User.'
      })
    } else res.send(data)
  })
}

exports.findAll = (req, res) => {
  const search = req.query.search

  User.getAll(search, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Users.'
      })
    } else res.send(data)
  })
}

exports.findOne = (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving User with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  User.updateById(req.params.id, new User(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating User with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.chgPwd = (req, res) => {
  User.chgPwd(req.params.id, req.body, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'same_password':
          res.status(400).send({
            message: 'Passwords are all the same. Nothing to change.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found User with id ${req.params.id}.`
          })
          break
        case 'wrong_curr_password':
          res.status(400).send({
            message: 'Current password not matching.'
          })
          break
        default:
          res.status(500).send({
            message: 'Error updating User with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Password changed successfuly.' })
  })
}

exports.delete = (req, res) => {
  User.remove(req.params.id, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message: 'User has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found User with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete User with id ' + req.params.id
          })
      }
    } else res.send({ message: 'User was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  User.removeAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all Users.'
      })
    } else res.send({ message: 'All Users were deleted successfully!' })
  })
}

exports.login = (req, res) => {
  User.login(req.body, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'not_found':
          res.status(404).send({
            message: `Not found User with id ${req.params.id}.`
          })
          break
        case 'wrong_password':
          res.status(401).send({
            message: 'Email or password incorrect.'
          })
          break
        default:
          res.status(500).send({
            message: 'Error retrieving User with id ' + req.params.id
          })
      }
    } else res.send(data)
  })
}
