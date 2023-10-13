const Joi = require("joi");

const validateChat = async (chat) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    message: Joi.string().required(),
  });

  try {
    await schema.validateAsync(chat);
  } catch (error) {
    return error.details[0].message;
  }
};


module.exports = {
    validateChat
};
