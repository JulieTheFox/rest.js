'use strict'

module.exports = request

const fetch = require('node-fetch').default
const pick = require('lodash/pick')

const deprecate = require('../deprecate')
const getBuffer = require('./get-buffer-response')
const HttpError = require('./http-error')

function request (requestOptions) {
  let headers = {}
  let status

  return fetch(requestOptions.url, pick(requestOptions, 'method', 'body', 'headers', 'timeout', 'agent'))

    .then(response => {
      status = response.status
      for (const keyAndValue of response.headers.entries()) {
        headers[keyAndValue[0]] = keyAndValue[1]
      }

      if (status === 204 || status === 205) {
        return
      }

      // GitHub API returns 200 for HEAD requsets
      if (requestOptions.method === 'HEAD') {
        if (status < 400) {
          return
        }

        throw new HttpError(response.statusText, status, headers)
      }

      if (status === 304) {
        requestOptions.url = response.headers.location
        throw new HttpError('Not modified', status, headers)
      }

      if (status >= 400) {
        return response.text()

          .then(message => {
            throw new HttpError(message, status, headers)
          })
      }

      const contentType = response.headers.get('content-type')
      if (/application\/json/.test(contentType)) {
        return response.json()
      }

      if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
        return response.text()
      }

      return getBuffer(response)
    })

    .then(data => {
      return {
        data,
        status,
        headers,
        get meta () {
          deprecate('response.meta – use response.headers instead (#896)')
          return headers
        }
      }
    })

    
}
