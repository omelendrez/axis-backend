const toWeb = (data) => {
  const exclude = [
    'password',
    'new_password'
  ]

  const newData = {}

  Object.entries(data)
    .forEach(([field, value]) => {
      if (!exclude.includes(field)) {
        newData[field] = value
      }
    })

  return newData

}

module.exports = { toWeb }
