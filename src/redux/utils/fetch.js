require('es6-promise').polyfill()
import fetch from 'isomorphic-fetch'

function get (uri, data, headers = {}) {
  return fetch(uri, { method: 'GET', headers: headers })
  .catch(err => {
    throw err
  })
  .then(res => handleResponse(res))
}

function post (uri, data, headers = {}) {
  return fetch(uri, { method: 'POST', headers: headers })
  .catch(err => {
    throw err
  })
}

function put (uri, data, headers = {}) {
  return fetch(uri, { method: 'PUT', headers: headers })
  .catch(err => {
    throw err
  })
}

function handleResponse (res) {
  return res.json()
}

export default {
  get,
  post,
  put
}
