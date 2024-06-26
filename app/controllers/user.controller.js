const User = require('../models/user.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const user = new User({
    email: req.body.email,
    full_name: req.body.full_name,
    name: req.body.name,
    password: req.body.password,
    status: req.body.status
  })

  User.create(user, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'User with same name already exists in database.'
        })
      } else {
        res.status(500).send({
          message: err.message || 'Some error occurred while creating the User.'
        })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  const pagination = req.query

  User.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Users.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: `Error retrieving User with id ${req.params.id}`
        })
      }
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOneView = (req, res, next) => {
  User.findByIdView(req.params.id, (err, data) => {
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
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.update = (req, res, next) => {
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
          message: `Error updating User with id ${req.params.id}`
        })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.chgPwd = (req, res) => {
  User.chgPwd(req.params.id, req.body, (err) => {
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
            message: `Error updating User with id ${req.params.id}`
          })
      }
    } else res.send({ message: 'Password changed successfully.' })
  })
}

exports.reset = (req, res) => {
  User.reset(req.params.id, (err) => {
    if (err) {
      res.status(500).send({
        message: `Error trying to reset password for User with id ${req.params.id}`
      })
    } else res.send({ message: 'Password reset successfully.' })
  })
}

exports.delete = (req, res, next) => {
  User.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message:
              'User has rows assigned with another table and cannot be deleted.'
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
    } else {
      res.send({ message: 'User was deleted successfully!' })
      next()
    }
  })
}

// exports.deleteAll = (req, res) => {
//   User.removeAll((err) => {
//     if (err) {
//       res.status(500).send({
//         message: err.message || 'Some error occurred while removing all Users.'
//       })
//     } else {
//       res.send({ message: 'All Users were deleted successfully!' })
//     }
//   })
// }

exports.login = (req, res) => {
  User.login(req.body, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'not_found':
          res.status(404).send({
            message: err.message || 'Login failed'
          })
          break
        case 'wrong_password':
          res.status(401).send({
            message: 'Username or password incorrect.'
          })
          break
        default:
          res.status(500).send({
            message: err.message || 'Login failed'
          })
      }
    } else res.send(data)
  })
}
