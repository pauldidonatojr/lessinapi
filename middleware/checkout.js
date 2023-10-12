const Joi = require("joi");

const validateFields = async (checkout) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  try {
    await schema.validateAsync(checkout);
  } catch (error) {
    return error.details[0].message;
  }
};


module.exports = {
    validateFields
};
