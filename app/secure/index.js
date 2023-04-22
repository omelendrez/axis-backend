const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const createToken = async (user) =>
  await jwt.sign(
    { data: user },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
    { algorithm: 'HS256' }
  )

const verifyToken = async (token) =>
  await jwt.verify(token, process.env.JWT_SECRET)

const passwordHash = async (password) => await bcrypt.hash(password, 10)

const comparePassword = async (password1, password2) =>
  await bcrypt.compare(password1, password2)

module.exports = {
  createToken,
  verifyToken,
  passwordHash,
  comparePassword
}
