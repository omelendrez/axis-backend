const Role = require('../models/role.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const role = new Role({
    name: req.body.name
  })

  Role.create(role, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Role.'
      })
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  const pagination = req.query

  Role.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Roles.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  Role.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Role with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Role with id ' + req.params.id
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

  Role.updateById(req.params.id, new Role(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Role with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Role with id ' + req.params.id
        })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.delete = (req, res, next) => {
  Role.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete_sys_admin':
          res.status(404).send({
            message: 'Role System Admin cannot be deleted.'
          })
          break
        case 'cannot_delete':
          res.status(404).send({
            message:
              'Role has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Role with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Role with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Role was deleted successfully!' })
      next()
    }
  })
}

exports.deleteAll = (req, res, next) => {
  Role.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all Roles.'
      })
    } else {
      res.send({ message: 'All Roles were deleted successfully!' })
      next()
    }
  })
}
