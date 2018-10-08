'use strict';

const axios = require('axios'),
  logger = require('../logger'),
  host = 'https://jsonplaceholder.typicode.com';

exports.getAllAlbums = () => {
  return new Promise((resolve, reject) => {
    const path = '/albums';
    axios
      .get(host + path)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};
