const jwt = require('jwt-simple'),
  moment = require('moment'),
  config = require('../../config'),
  logger = require('../logger');

exports.createToken = function(user) {
  const payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: moment()
      .add(14, 'days')
      .unix()
  };
  return jwt.encode(payload, config.common.jwt.secret_token);
};

exports.decodeToken = token => {
  return jwt.decode(token, config.common.jwt.secret_token);
};
