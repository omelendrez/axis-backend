const Company = require('../models/company.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const company = new Company({
    name: req.body.name,
    status: req.body.status,
    email: req.body.email,
    contact: req.body.contact
  })

  Company.create(company, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        return res.status(400).send({
          message: 'A Company with the same name already exists in database.'
        })
      }
      return res.status(500).send({
        message:
          err.message || 'Some error occurred while creating the Company.'
      })
    }

    res.send(data)
    next()
  })
}

exports.findAll = (req, res, next) => {
  const pagination = req.query

  Company.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Companys.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
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
    } else {
      res.send(data)
      next()
    }
  })
}

exports.delete = (req, res, next) => {
  Company.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message:
              'Company has rows assigned with another table and cannot be deleted.'
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
    } else {
      res.send({ message: 'Company was deleted successfully!' })
      next()
    }
  })
}

// exports.deleteAll = (req, res, next) => {
//   Company.removeAll((err) => {
//     if (err) {
//       res.status(500).send({
//         message:
//           err.message || 'Some error occurred while removing all Companys.'
//       })
//     } else {
//       res.send({ message: 'All Companys were deleted successfully!' })
//       next()
//     }
//   })
// }
