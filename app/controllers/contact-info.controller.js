const ContactInfo = require('../models/contact-info.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const contactInfo = new ContactInfo({
    learner: req.body.learner,
    type: req.body.type,
    value: req.body.value
  })

  ContactInfo.create(contactInfo, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message:
            'A Contact Info with the same type already exists for this Learner in database.'
        })
      } else {
        res.status(500).send({
          message:
            err.message ||
            'Some error occurred while creating the Contact Info.'
        })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  ContactInfo.getAll(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Contact Info.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  ContactInfo.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found ContactInfo with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving ContactInfo with id ' + req.params.id
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

  ContactInfo.updateById(
    req.params.id,
    new ContactInfo(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Contact Info with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Contact Info with id ' + req.params.id
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
  ContactInfo.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'not_found':
          res.status(404).send({
            message: `Not found Contact Info with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Contact Info with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Contact Info was deleted successfully!' })
      next()
    }
  })
}

exports.deleteAll = (req, res, next) => {
  ContactInfo.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Contact Info.'
      })
    } else {
      res.send({ message: 'All Contact Info were deleted successfully!' })
      next()
    }
  })
}
