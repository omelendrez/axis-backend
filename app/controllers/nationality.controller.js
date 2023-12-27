const Nationality = require('../models/nationality.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const nationality = new Nationality({
    code: req.body.code,
    country: req.body.country,
    nationality: req.body.nationality
  })

  Nationality.create(nationality, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while creating the Nationality.'
      })
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  const pagination = req.query

  Nationality.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Nationalities.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  Nationality.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Nationality with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Nationality with id ' + req.params.id
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

  Nationality.updateById(
    req.params.id,
    new Nationality(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Nationality with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Nationality with id ' + req.params.id
          })
        }
      } else {
        res.send(data)
        next()
      }
    }
  )
}

exports.delete = (req, res, next) => {
  Nationality.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message:
              'Nationality has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Nationality with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Nationality with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Nationality was deleted successfully!' })
      next()
    }
  })
}

exports.deleteAll = (req, res, next) => {
  Nationality.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Nationalities.'
      })
    } else {
      res.send({ message: 'All Nationalities were deleted successfully!' })
      next()
    }
  })
}
