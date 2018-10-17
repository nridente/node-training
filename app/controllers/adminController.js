'user strict';

const models = require('../models'),
  error = require('../errors'),
  logger = require('../logger'),
  md5 = require('md5'),
  User = models.User,
  Token = models.Token,
  jwtService = require('../services/jwt'),
  userHelper = require('./helpers/userHelper');

const createAdmin = (body, res, next) => {
  User.create({
    email: body.email,
    name: body.name,
    last_name: body.last_name,
    password: md5(body.password),
    admin: true
  })
    .then(() => {
      logger.info(`admin ${body.last_name} ${body.name} created.`);
      return res.send(`admin ${body.last_name} ${body.name} created.`);
    })
    .catch(err => {
      logger.info(err);
      next(err);
    });
};

const updateAdmin = (user, body, res, next) => {
  user
    .update({
      admin: true
    })
    .then(() => {
      logger.info(`user ${body.last_name} ${body.name} is now an admin.`);
      return res.send(`user ${body.last_name} ${body.name} is now an admin.`);
    })
    .catch(err => {
      logger.info(err);
      return next(err);
    });
};

exports.setAdmin = (req, res, next) => {
  const body = req.body;
  if (!userHelper.signUpValidations(User, body, next)) {
    User.findOne({ where: { email: body.email } }).then(user => {
      if (user && user.admin) {
        return next(error.invalidEmail(`an admin already exists with the email ${body.email}.`));
      } else if (user && !user.admin) {
        updateAdmin(user, body, res, next);
      } else {
        createAdmin(body, res, next);
      }
    });
  }
};

exports.setTokenTime = (req, res, next) => {
  const body = req.body;
  userHelper.isAdmin(req.decodedToken.sub, User).then(admin => {
    logger.info(admin);
    if (!admin) {
      logger.info(`conexion refued becouse the user is not an administrator`);
      next(error.notAllowed(`refused conexion becouse not enough permissions`));
    }
    Token.findOne()
      .then(token => {
        token.time_exp = body.time_exp;
        token.type_exp = body.type_exp;
        token
          .save(token)
          .then(() => {
            res.send('token settings saved');
          })
          .catch(err => {
            logger.error('there was an error trying to modify token settings');
            next(err);
          });
      })
      .catch(err => {
        logger.info('there was an error retriving the token settings');
        next(err);
      });
  });
};
