const userController = require('./controllers/userController'),
  adminController = require('./controllers/adminController'),
  albumController = require('./controllers/albumController'),
  logger = require('./logger'),
  error = require('./errors');

const _isAuthenticated = (req, res, next) => {
  const token = req.headers['x-access-token'];
  logger.info(`token header: ${token}`);
  if (!token) {
    logger.info('refused request because user is not authenticated');
    return next(error.authenticationError('user not authenticated'));
  }
  next();
};

exports.init = app => {
  // commom users endpoints
  app.get('/users/page/:page', [_isAuthenticated], userController.getAllUsers);
  app.post('/users', [], userController.setUser);
  app.post('/users/sessions', [], userController.signIn);
  // admin users endpoints
  app.post('/admin/users', [_isAuthenticated], adminController.setAdmin);
  // album endpoints
  app.get('/albums', [_isAuthenticated], albumController.listAlbums);
  app.post('/albums/:album_id', [_isAuthenticated], albumController.buyAlbum);
};
