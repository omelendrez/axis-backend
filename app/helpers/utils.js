const toWeb = (user) => {
  const removeFields = {
    password: undefined,
    new_password: undefined
  }
  return { ...user, ...removeFields }
}

module.exports = { toWeb }
