const Status = require('../models/status.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const status = new Status({
    status: req.body.status,
    continue_flow: req.body.continue_flow
  })

  Status.create(status, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Status.'
      })
    } else res.send(data)
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  Status.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Status.'
      })
    } else res.send(data)
  })
}

exports.findOne = (req, res) => {
  Status.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Status with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Status with id ' + req.params.id
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

  Status.updateById(req.params.id, new Status(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Status with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Status with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Status.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message:
              'Status has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Status with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Status with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Status was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Status.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all Status.'
      })
    } else res.send({ message: 'All Status were deleted successfully!' })
  })
}
