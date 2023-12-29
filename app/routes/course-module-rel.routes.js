const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const courseModuleRel = require('../controllers/course-module-rel.controller')

  const router = require('express').Router()

  router.post('/', secure, courseModuleRel.create)

  router.get('/:id', secure, courseModuleRel.findAll)

  router.get('/:id/available', secure, courseModuleRel.findAllAvailable)

  router.delete('/:id', secure, courseModuleRel.delete)

  router.delete('/', secure, courseModuleRel.deleteAll)

  app.use('/api/course-module-rel', router)
}
