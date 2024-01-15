const CertificateType = require('../models/certificate-type.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const certificateType = new CertificateType({
    code: req.body.code,
    country: req.body.country,
    certificateType: req.body.certificateType
  })

  CertificateType.create(certificateType, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while creating the Certificate Type.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  CertificateType.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while retrieving Certificate Types.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findOne = (req, res) => {
  CertificateType.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Certificate Type with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Certificate Type with id ' + req.params.id
        })
      }
    } else {
      res.send(data)
    }
  })
}

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  CertificateType.updateById(
    req.params.id,
    new CertificateType(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: `Not found Certificate Type with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: 'Error updating Certificate Type with id ' + req.params.id
          })
        }
      } else {
        res.send(data)
      }
    }
  )
}

exports.delete = (req, res) => {
  CertificateType.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message:
              'Certificate Type has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Certificate Type with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message:
              'Could not delete Certificate Type with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Certificate Type was deleted successfully!' })
    }
  })
}

// exports.deleteAll = (req, res) => {
//   CertificateType.removeAll((err) => {
//     if (err) {
//       res.status(500).send({
//         message:
//           err.message ||
//           'Some error occurred while removing all Certificate Types.'
//       })
//     } else {
//       res.send({ message: 'All Certificate Types were deleted successfully!' })
//     }
//   })
// }
