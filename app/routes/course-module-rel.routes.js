const router = require('express').Router()
const courseModuleRel = require('../controllers/course-module-rel.controller')
const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  router.post('/', secure, courseModuleRel.create)

  router.get('/:id', secure, courseModuleRel.findAll)

  router.get('/:id/available', secure, courseModuleRel.findAllAvailable)

  router.delete('/:id', secure, courseModuleRel.delete)

  app.use('/api/course-module-rel', router)
}
