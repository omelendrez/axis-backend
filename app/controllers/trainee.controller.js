const Trainee = require('../models/trainee.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const trainee = new Trainee({
    type: req.body.type,
    badge: req.body.badge,
    last_name: req.body.last_name,
    first_name: req.body.first_name,
    sex: req.body.sex,
    state: req.body.state,
    nationality: req.body.nationality,
    birth_date: req.body.birth_date,
    company: req.body.company,
    status: req.body.status
  })

  Trainee.create(trainee, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: `Trainee with same names and birth date already exists in database.`
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the Trainee.'
        })
      }
    } else res.send(data)
  })
}

exports.findAll = (req, res) => {
  const search = req.query.search

  Trainee.getAll(search, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Trainees.'
      })
    } else res.send(data)
  })
}

exports.findOne = (req, res) => {
  Trainee.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Trainee with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Trainee with id ' + req.params.id
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

  Trainee.updateById(req.params.id, new Trainee(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Trainee with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Trainee with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Trainee.remove(req.params.id, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message: 'Trainee has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Trainee with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Trainee with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Trainee was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Trainee.removeAll((err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Trainees.'
      })
    } else res.send({ message: 'All Trainees were deleted successfully!' })
  })
}
