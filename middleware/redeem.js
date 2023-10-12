const Joi = require("joi");

const validateFields = async (redeem) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().string().required()
  });

  try {
    await schema.validateAsync(redeem);
  } catch (error) {
    return error.details[0].message;
  }
};


module.exports = {
    validateFields
};
