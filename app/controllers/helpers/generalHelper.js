'use strict';

const commonAttrs = ['id', 'freezeTableName', 'createdAt', 'updatedAt'];

exports.requiredAttributes = (model, bodyParams) => {
  const params = Object.keys(bodyParams);
  const modelAttrs = Object.keys(model.attributes).filter(attr => !model.attributes[attr].allowNull);
  const reqAttrs = modelAttrs.filter(attr => !commonAttrs.includes(attr));
  return reqAttrs.every(attr => params.indexOf(attr) > -1);
};
