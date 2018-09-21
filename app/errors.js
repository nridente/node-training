const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.INVALID_EMAIL = 'invalid_email';
exports.INVALID_DOMAIN_EMAIL = 'invalid_domain_email';
exports.INVALID_PASSWORD_LENGTH = 'invalid_password_length';
exports.INVALID_REQUESTED_PARAMS = 'invalid_requested_params';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
exports.invalidDomainEmail = message => internalError(message, exports.INVALID_DOMAIN_EMAIL);
exports.invalidEmail = message => internalError(message, exports.INVALID_EMAIL);
exports.passwordLength = message => internalError(message, exports.INVALID_PASSWORD_LENGTH);
exports.invalidRequedtedParams = message => internalError(message, exports.INVALID_REQUESTED_PARAMS);
