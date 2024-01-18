const Title = require('../models/title.model')

exports.findAll = (req, res, next) => {
  const pagination = req.query

  Title.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Titles.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}
