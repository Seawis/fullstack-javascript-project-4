const axiosErrors = (error, info) => {
  if (error.response) {
    console.error(`An error "${error.response.status}" has occurred with "${info}"`)
    process.exit(2) // throw new Error(error.response.status)
  }
  else if (error.request) {
    console.error(`Error: ${error.request}\nAn error has occurred with "${info}"`)
    process.exit(3) // throw new Error(error.request)
  }
  else {
    console.error(`An error has occurred: ${info}`)
    process.exit(4) // throw new Error(error.message)
  }
}

const savingErrors = (err) => {
  if (err.errno === -17) {
    return console.error(`Already exists: "${err.path}"`)
  }
  if (err.errno === -13) {
    console.error(`Permission denied: "${err.path}"`)
    process.exit(13)
  }
  else {
    console.error(`No such file or directory "${err.path || err}"`)
    process.exit(1)
  }
}

export { axiosErrors, savingErrors }
