const debug = require('debug')('octokit:rest')
const defaults = require('lodash/defaults')
const isPlainObject = require('lodash/isPlainObject')
const HttpError = require('./http-error');

module.exports = initialize;

function prepareRequestOptions (requestOptions) {
    debug('REQUEST:', requestOptions)
  
    // calculate content length unless body is a stream, in which case the
    // content length is already set per option
    if (requestOptions.body) {
      defaults(requestOptions.headers, {
        'content-type': 'application/json; charset=utf-8'
      })
    }
  
    // https://fetch.spec.whatwg.org/#methods
    requestOptions.method = requestOptions.method.toUpperCase()
  
    // GitHub expects "content-length: 0" header for PUT/PATCH requests without body
    // fetch does not allow to set `content-length` header, but we can set body to an empty string
    if (['PATCH', 'PUT'].indexOf(requestOptions.method) >= 0 && !requestOptions.body) {
      requestOptions.body = ''
    }
  
    if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
      requestOptions.body = JSON.stringify(requestOptions.body)
    }
    
    return requestOptions;
};

function initialize(requestOptions) {
    const sendRequest  = requestOptions.useCustomClient ? requestOptions.useCustomClient : require('./request');

    return function request(requestOptions) {
        prepareRequestOptions(requestOptions);
        return sendRequest(requestOptions).catch(error => {
            if (error instanceof HttpError) {
              throw error
            }
      
            throw new HttpError(error.message, 500, headers)
          })
    }

}