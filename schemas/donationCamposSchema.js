const Joi = require('joi');
const moment = require('moment-timezone');

// Configura o locale para português
moment.locale('pt-br');
const today = new Date().toISOString().split('T')[0]; 

const donationSchema = Joi.object({
  name: Joi.string().required(),
  userId: Joi.string().required(),
  donationType: Joi.string().valid('roupa', 'alimentos', 'outro').required(),
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      category: Joi.string().required(),
      description: Joi.string().allow(''),
      condition: Joi.string().valid('novo', 'usado', 'danificado').when('donationType', {
        is: 'roupa',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    }).min(1).required()
  ),
  status: Joi.string().required(),
  pickupAddress: Joi.object({
    street: Joi.string().required(),
    complement: Joi.string().allow(''),
    city: Joi.string().required(),
  }).required(),
  specialNotes: Joi.string().allow(''),
  scheduledDate: Joi.date()
    .iso() // Garante o formato ISO 8601 (ex: "2023-12-31" ou "2023-12-31T10:00:00Z")
    .min(today) // Data deve ser >= data/hora atual
    .required()
    .messages({
      'date.base': 'A data agendada deve estar em um formato válido (ISO 8601)',
      'date.isoDate': 'A data agendada deve estar no formato ISO 8601 (ex: "YYYY-MM-DD" ou "YYYY-MM-DDTHH:MM:SSZ")',
      'date.min': 'A data agendada deve ser igual ou maior à data atual',
      'any.required': 'A data agendada é obrigatória',
    }),
});

// Middleware para validação
const validateDonation = (req, res, next) => {
  const { error } = donationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

 module.exports = validateDonation;

