const userController = require('./controllers/userController'),
  adminController = require('./controllers/adminController'),
  albumController = require('./controllers/albumController'),
  jwtService = require('./services/jwt'),
  logger = require('./logger'),
  error = require('./errors'),
  moment = require('moment');

const _isAuthenticated = (req, res, next) => {
  const token = req.headers['x-access-token'],
    rnow = moment().unix();
  if (!token) {
    logger.info('refused request because user is not authenticated');
    return next(error.authenticationError('user not authenticated'));
  }
  try {
    req.decodedToken = jwtService.decodeToken(req.headers['x-access-token']);
  } catch (err) {
    logger.info('refused conexion becouse the token has expired');
    return next(error.authenticationError('expired session time'));
  }
  next();
};

exports.init = app => {
  // commom users endpoints
  app.get('/users/page/:page', [_isAuthenticated], userController.getAllUsers);
  app.post('/users', [], userController.setUser);
  app.post('/users/sessions', [], userController.signIn);
  app.get('/users/:user_id/albums', [_isAuthenticated], userController.getUserAlbums);
  app.get('/users/albums/:album_id/photos', [_isAuthenticated], userController.getUserAlbumPhotos);
  // admin users endpoints
  app.post('/admin/users', [_isAuthenticated], adminController.setAdmin);
  app.post('/admin/token-settings', [_isAuthenticated], adminController.setTokenTime);
  // album endpoints
  app.get('/albums', [_isAuthenticated], albumController.listAlbums);
  app.post('/albums/:album_id', [_isAuthenticated], albumController.buyAlbum);
};
