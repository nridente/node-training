const jwt = require('jwt-simple'),
  moment = require('moment'),
  config = require('../../config'),
  logger = require('../logger'),
  models = require('../models');

const Token = models.Token;

exports.createToken = user => {
  return new Promise((resolve, reject) => {
    Token.findOne().then(token => {
      const payload = {
        sub: user.id,
        iat: moment().unix(),
        exp: moment()
          .add(token.time_exp, token.type_exp)
          .unix()
      };
      resolve({
        token: jwt.encode(payload, config.common.jwt.secret_token),
        duration: `${token.time_exp} ${token.type_exp}`
      });
    });
  });
};

exports.decodeToken = token => {
  return jwt.decode(token, config.common.jwt.secret_token);
};
