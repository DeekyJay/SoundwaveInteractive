require('es6-promise').polyfill()
import fetch from 'isomorphic-fetch'

function get (uri, data, headers = {}) {
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = 'application/json'
  return fetch(uri, { method: 'GET', headers: headers })
  .catch(err => {
    throw err
  })
  .then(res => handleResponse(res))
}

function post (uri, data, headers = {}) {
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = 'application/json'
  return fetch(uri, { method: 'POST', headers: headers, body: JSON.stringify(data) })
  .catch(err => {
    throw err
  })
  .then(res => parseJson(res))
}

function put (uri, data, headers = {}) {
  headers = setHeaders(headers)
  return fetch(uri, { method: 'PUT', headers: headers, body: data ? JSON.stringify(data) : '' })
  .catch(err => {
    throw err
  })
  .then(res => parseJson(res))
}

function handleResponse (res) {
  return res.json()
}

function parseJson (res) {
  return res.json()
}

function setHeaders (headers) {
  headers['Accept'] = 'application/json'
  headers['Content-Type'] = 'application/json'
  headers['X-Auth-Token'] = localStorage.getItem('si-token') || ''
  return headers
}

export default {
  get,
  post,
  put
}
