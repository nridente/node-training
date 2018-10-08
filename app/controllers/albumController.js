'use strict';

const albumService = require('../services/albumService.js'),
  logger = require('../logger');

exports.listAlbums = (req, res, next) => {
  albumService.getAllAlbums().then(response => {
    res.send({ data: response });
  });
};
