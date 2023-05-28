const Assesment = require('../models/course-assesment.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const assesment = new Assesment({
    name: req.body.name
  })

  Assesment.create(assesment, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Assesment with same name already exists in database.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the Assesment.'
        })
      }
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  Assesment.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Assesments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findAllView = (req, res) => {
  Assesment.getAllView(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Assesments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findOne = (req, res) => {
  Assesment.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Assesment with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Assesment with id ' + req.params.id
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

  Assesment.updateById(req.params.id, new Assesment(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Assesment with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Assesment with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Assesment.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message: 'Assesment has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Assesment with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Assesment with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Assesment was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Assesment.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Assesments.'
      })
    } else res.send({ message: 'All Assesments were deleted successfully!' })
  })
}
