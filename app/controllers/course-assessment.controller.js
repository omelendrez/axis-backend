const Assessment = require('../models/course-assessment.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const assessment = new Assessment({
    name: req.body.name
  })

  Assessment.create(assessment, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message: 'Assessment with same name already exists in database.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the Assessment.'
        })
      }
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  Assessment.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Assessments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findAllView = (req, res) => {
  Assessment.getAllView(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Assessments.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findOne = (req, res) => {
  Assessment.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Assessment with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Assessment with id ' + req.params.id
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

  Assessment.updateById(
    req.params.id,
    new Assessment(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Assessment with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Assessment with id ' + req.params.id
          })
        }
      } else res.send(data)
    }
  )
}

exports.delete = (req, res) => {
  Assessment.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message: 'Assessment has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Assessment with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Assessment with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Assessment was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Assessment.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Assessments.'
      })
    } else res.send({ message: 'All Assessments were deleted successfully!' })
  })
}
