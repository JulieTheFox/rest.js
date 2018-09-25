module.exports = initialize

const restEndpoint = require('../endpoint')
const sendRequest = require('./request-sender')

function initialize (requestOptions) {
  const request = sendRequest(requestOptions);
  return function restRequest (endpointOptions) {
    const requestOptions = restEndpoint(endpointOptions)
    return request(requestOptions)
  }
}

