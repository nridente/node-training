'use strict';

const albumService = require('../services/albumService.js'),
  error = require('../errors'),
  models = require('../models'),
  logger = require('../logger'),
  AlbumPerUser = models.Album_User;

exports.listAlbums = (req, res, next) => {
  albumService.getAllAlbums().then(response => {
    res.send({ data: response });
  });
};

exports.buyAlbum = (req, res, next) => {
  const body = req.body,
    albumId = req.params.album_id;
  AlbumPerUser.count({ where: { user_id: body.user_id, album_id: albumId } }).then(count => {
    if (count) {
      logger.info(`album already purchased by this user.`);
      return next(error.albumAlreadyPurshased(`album already purchased by this user`));
    }
    albumService
      .getAlbum(albumId)
      .then(album => {
        if (!album.id) {
          logger.info(`there is not albums with the id ${albumId}`);
          return next(error.albumNotFound(`not albums where found with the requested id ${albumId}`));
        }
        AlbumPerUser.create({
          album_id: albumId,
          user_id: body.user_id
        })
          .then(() => {
            logger.info(`album ${album.title} successfully purchased.`);
            res.send(`album ${album.title} successfully purchased.`);
          })
          .catch(err => {
            logger.error(err);
            next(err);
          });
      })
      .catch(err => {
        next(err);
      });
  });
};
