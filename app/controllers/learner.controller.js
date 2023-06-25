const Learner = require('../models/learner.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const learner = new Learner({
    type: req.body.type,
    badge: req.body.badge,
    first_name: req.body.first_name,
    middle_name: req.body.middle_name,
    last_name: req.body.last_name,
    sex: req.body.sex,
    state: req.body.state,
    nationality: req.body.nationality,
    birth_date: req.body.birth_date,
    company: req.body.company,
    status: req.body.status
  })

  Learner.create(learner, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message:
            'Learner with same names and birth date already exists in database.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the Learner.'
        })
      }
    } else res.send(data)
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  Learner.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Learners.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findOne = (req, res) => {
  Learner.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Learner with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Learner with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.findOneView = (req, res) => {
  Learner.findByIdView(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Learner with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Learner with id ' + req.params.id
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

  Learner.updateById(req.params.id, new Learner(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Learner with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Learner with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Learner.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message: 'Learner has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Learner with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Learner with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Learner was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Learner.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Learners.'
      })
    } else res.send({ message: 'All Learners were deleted successfully!' })
  })
}
