const dictum = require('dictum.js');

dictum.document({
  description: 'Some description for the given endpoint',
  endpoint: '/users',
  method: 'POST',
  requestHeaders: { 'Content-Type': 'application/json' },
  requestPathParams: {
    /* path params for endpoint */
  },
  requestBodyParams: {
    email: 'email@wolox.com.ar',
    name: 'Valdomero',
    last_name: 'Lord',
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
