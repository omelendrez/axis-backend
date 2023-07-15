const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const courseItemRel = require('../controllers/course-item-rel.controller')

  const router = require('express').Router()

  router.post('/', secure, courseItemRel.create)

  router.get('/:id', secure, courseItemRel.findAll)

  router.get('/:id/available', secure, courseItemRel.findAllAvailable)

  router.delete('/:id', secure, courseItemRel.delete)

  router.delete('/', secure, courseItemRel.deleteAll)

  app.use('/api/course-item-rel', router)
}
