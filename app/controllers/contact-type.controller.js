const ContactType = require('../models/contact-type.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const contactType = new ContactType({
    code: req.body.code,
    country: req.body.country,
    contactType: req.body.contactType
  })

  ContactType.create(contactType, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while creating the Contact Type.'
      })
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  const pagination = req.query

  ContactType.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Contact Types.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  ContactType.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Contact Type with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Contact Type with id ' + req.params.id
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

  ContactType.updateById(
    req.params.id,
    new ContactType(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Contact Type with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Contact Type with id ' + req.params.id
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
  ContactType.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message:
              'Contact Type has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Contact Type with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Contact Type with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Contact Type was deleted successfully!' })
      next()
    }
  })
}

exports.deleteAll = (req, res, next) => {
  ContactType.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Contact Types.'
      })
    } else {
      res.send({ message: 'All Contact Types were deleted successfully!' })
      next()
    }
  })
}
