'user strict';

const models = require('../models'),
  error = require('../errors'),
  logger = require('../logger'),
  md5 = require('md5'),
  User = models.User,
  jwtService = require('../services/jwt'),
  userHelper = require('./helpers/userHelper');

exports.getAllUsers = (req, res, next) => {
  const rowsPerPage = 15,
    page = req.params.page;
  User.findAll({ offset: page * rowsPerPage - rowsPerPage, limit: rowsPerPage })
    .then(users => {
      User.count()
        .then(count => {
          res.send({
            users: JSON.stringify(users),
            current_page: page,
            pages: Math.ceil(count / rowsPerPage)
          });
        })
        .catch(err => {
          logger.info('error while trying to count all users');
          next(err);
        });
    })
    .catch(err => {
      logger.info('error while listing all users with pagination');
      next(err);
    });
};

exports.getUser = (req, res, next) => {
  User.findOne({ where: { email: req.params.email } }).then(user => {
    res.send(JSON.stringify(user));
  });
};

exports.setUser = (req, res, next) => {
  const body = req.body;
  if (!userHelper.signUpValidations(User, body, next)) {
    User.findOne({ where: { email: body.email } }).then(user => {
      if (user) return next(error.invalidEmail(`email: ${body.email} already exists.`));
      User.create({
        email: body.email,
        name: body.name,
        last_name: body.last_name,
        password: md5(body.password)
      })
        .then(() => {
          logger.info(`user ${body.last_name} ${body.name} created.`);
          return res.send(`user ${body.last_name} ${body.name} created.`);
        })
        .catch(err => {
          logger.info(err);
          next(err);
        });
    });
  }
};

exports.signIn = (req, res, next) => {
  const body = req.body;
  if (!userHelper.validateValidDomainEmail(body, next)) {
    User.count({ where: { email: body.email, password: md5(body.password) } })
      .then(user => {
        if (user) {
          logger.info(`user ${body.email} signed in successfull.`);
          return res.send({ token: jwtService.createToken(user) });
        } else {
          logger.info(`either email or password are wrong.`);
          next(error.authenticationError(`either email or password are wrong.`));
        }
      })
      .catch(err => {
        logger.info(err);
        next(err);
      });
  }
};
