const userController = require('./controllers/userController'),
  adminController = require('./controllers/adminController'),
  albumController = require('./controllers/albumController'),
  jwtService = require('./services/jwt'),
  logger = require('./logger'),
  error = require('./errors'),
  models = require('./models'),
  moment = require('moment'),
  User = models.User;

const checkInvalidatedSessions = (userId, tokenCreation) => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { id: userId } })
      .then(user => {
        resolve(tokenCreation > moment(user.last_invalidated_sessions_at).unix());
      })
      .catch(err => {
        reject(err);
      });
  });
};

const isAuthenticated = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    logger.info('refused request because user is not authenticated');
    return next(error.authenticationError('user not authenticated'));
  }
  try {
    const decodedToken = jwtService.decodeToken(req.headers['x-access-token']);
    checkInvalidatedSessions(decodedToken.sub, decodedToken.iat)
      .then(authorized => {
        if (!authorized) {
          logger.info('refused conexion becouse the token has been disabled');
          return next(error.notAllowed('token session has been disabled'));
        }
        req.decodedToken = decodedToken;
        next();
      })
      .catch(err => {
        logger.error('an error occured while trying to retreive user information in isAuthenticated');
        return next(err);
      });
  } catch (err) {
    logger.info('refused conexion becouse the token has expired');
    return next(error.authenticationError('expired session time'));
  }
};

exports.init = app => {
  // commom users endpoints
  app.get('/users/page/:page', [isAuthenticated], userController.getAllUsers);
  app.post('/users', [], userController.setUser);
  app.post('/users/sessions', [], userController.signIn);
  app.post('/users/sessions/invalidate-all', [isAuthenticated], userController.disableAllSessions);
  app.get('/users/:user_id/albums', [isAuthenticated], userController.getUserAlbums);
  app.get('/users/albums/:album_id/photos', [isAuthenticated], userController.getUserAlbumPhotos);
  // admin users endpoints
  app.post('/admin/users', [isAuthenticated], adminController.setAdmin);
  app.post('/admin/token-settings', [isAuthenticated], adminController.setTokenTime);
  // album endpoints
  app.get('/albums', [isAuthenticated], albumController.listAlbums);
  app.post('/albums/:album_id', [isAuthenticated], albumController.buyAlbum);
};
