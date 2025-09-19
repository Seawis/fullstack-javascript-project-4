export default (error, info) => {
  if (error.response) {
    console.log(`An error has occurred: ${info}`)
    throw new Error(error.response.status)
  }
  else if (error.request) {
    console.log(`An error has occurred: ${info}`)
    throw new Error(error.request)
  }
  else {
    console.log(`An error has occurred: ${info}`)
    throw new Error(error.message)
  }
}
