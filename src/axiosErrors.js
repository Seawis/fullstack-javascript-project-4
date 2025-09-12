export default (error) => {
  if (error.response) {
    throw new Error(error.response.status)
  }
  else if (error.request) {
    throw new Error(error.request)
  }
  else {
    throw new Error(error.message)
  }
}
