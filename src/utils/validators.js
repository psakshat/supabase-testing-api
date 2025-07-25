const Joi = require("joi");

const validateUUID = (id) => {
  const schema = Joi.string().guid({ version: ["uuidv4"] });
  const { error } = schema.validate(id);
  return !error;
};

const validateEmail = (email) => {
  const schema = Joi.string().email();
  const { error } = schema.validate(email);
  return !error;
};

const validatePassword = (password) => {
  const schema = Joi.string().min(6);
  const { error } = schema.validate(password);
  return !error;
};

module.exports = {
  validateUUID,
  validateEmail,
  validatePassword,
};
