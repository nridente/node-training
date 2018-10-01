const dictum = require('dictum.js');

dictum.document({
  description: 'POST - Create an user',
  endpoint: '/users',
  method: 'POST',
  requestHeaders: { 'Content-Type': 'application/json' },
  requestPathParams: {
    /* path params for endpoint */
  },
  requestBodyParams: {
    email: 'email@wolox.com.ar',
    name: 'fist name',
    last_name: 'last name',
    password: 'password'
  },
  responseStatus: 200,
  responseHeaders: {
    /* headers for response */
  },
  responseBody: {
    /* body params for response */
  },
  resource: 'My Resource'
});
