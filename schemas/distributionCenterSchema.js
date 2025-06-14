const Joi = require('joi');


// const needsSchema = Joi.object({
 
// });


const addressSchema = Joi.object({
 street: Joi.string().required(),
  number: Joi.string().required(),
  complement: Joi.string().allow(''),
  neighborhood: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().length(2).required(),
  zipCode: Joi.string().required()
}); 

const contactSchema = Joi.object({
 phone: Joi.string()
      .pattern(/^(\+244|\(244\))[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/)
      .required()
      .messages({
        'string.pattern.base': 'Use +244 ou (244) seguido de 9 dígitos (ex: +244 912 345 678)'
      }),
  email: Joi.string().email().required()
});

const operatingHoursSchema = Joi.object({
  weekdays: Joi.string().pattern(/^\d{2}:\d{2} às \d{2}:\d{2}$/).required(),
  weekends: Joi.string().pattern(/^\d{2}:\d{2} às \d{2}:\d{2}$/).required()
});

const  distributionCenterSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  needs: Joi.array().items(
    Joi.object({
      description: Joi.string().required(''),
      quantity: Joi.string().min(1).allow(''),
    }).min(1).required()
  ),
  address: addressSchema.required(),
  capacity: Joi.number().integer().min(1).max(1000).required(),
  manager: Joi.string().min(3).required(),
  contact: contactSchema.required(),
  operatingHours: operatingHoursSchema.required(),
//   needs: needsSchema.required()
});

module.exports = distributionCenterSchema;