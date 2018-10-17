const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.INVALID_EMAIL = 'invalid_email';
exports.INVALID_DOMAIN_EMAIL = 'invalid_domain_email';
exports.INVALID_PASSWORD_LENGTH = 'invalid_password_length';
exports.INVALID_REQUESTED_PARAMS = 'invalid_requested_params';
exports.AUTHENTICATION_ERROR = 'authentication_error';
exports.ALBUM_ALREADY_PURSHASED = 'album_already_purshased';
exports.ALBUM_NOT_FOUND = 'album_not_found';
exports.EXTERNAL_SERVICE_ERROR = 'external_service_error';
exports.NOT_ALLOWED = 'not_allowed';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
exports.invalidDomainEmail = message => internalError(message, exports.INVALID_DOMAIN_EMAIL);
exports.invalidEmail = message => internalError(message, exports.INVALID_EMAIL);
exports.passwordLength = message => internalError(message, exports.INVALID_PASSWORD_LENGTH);
exports.invalidRequedtedParams = message => internalError(message, exports.INVALID_REQUESTED_PARAMS);
exports.authenticationError = message => internalError(message, exports.AUTHENTICATION_ERROR);
exports.albumAlreadyPurshased = message => internalError(message, exports.ALBUM_ALREADY_PURSHASED);
exports.albumNotFound = message => internalError(message, exports.ALBUM_NOT_FOUND);
exports.externalServiceError = message => internalError(message, exports.EXTERNAL_SERVICE_ERROR);
exports.notAllowed = message => internalError(message, exports.NOT_ALLOWED);
