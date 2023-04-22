const Company = require('../models/company.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const company = new Company({
    code: req.body.code,
    name: req.body.name
  })

  Company.create(company, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while creating the Company.'
      })
    } else res.send(data)
  })
}

exports.findAll = (req, res) => {
  const search = req.query.search

  Company.getAll(search, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Companys.'
      })
    } else res.send(data)
  })
}

exports.findOne = (req, res) => {
  Company.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Company with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Company with id ' + req.params.id
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

  Company.updateById(req.params.id, new Company(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Company with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Company with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Company.remove(req.params.id, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message: 'Company has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Company with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Company with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Company was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Company.removeAll((err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Companys.'
      })
    } else res.send({ message: 'All Companys were deleted successfully!' })
  })
}
