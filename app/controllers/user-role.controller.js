const UserRole = require('../models/user-role.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  UserRole.create(req.body, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'User-Role already exists in database for this course.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while adding the user-role.'
        })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  UserRole.getAll(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving user-roles.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findAllAvailable = (req, res, next) => {
  UserRole.getAllAvailable(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving user-roles.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.delete = (req, res, next) => {
  UserRole.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message:
              'User-Role has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found user-role with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete user-role with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'User-Role was deleted successfully!' })
      next()
    }
  })
}

exports.deleteAll = (req, res, next) => {
  UserRole.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all user-roles.'
      })
    } else {
      res.send({ message: 'All user-roles were deleted successfully!' })
      next()
    }
  })
}
