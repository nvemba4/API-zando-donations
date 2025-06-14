const Joi = require('joi');

const provinces = ['LD', 'BG', 'HU', 'LB', 'CN']; // Códigos de províncias angolanas

const storeSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[\wÀ-ÿ\s]+$/) // Aceita caracteres acentuados
    .required()
    .messages({
      'string.pattern.base': 'O nome deve conter apenas letras e números'
    }),

  address: Joi.object({
    street: Joi.string()
      .min(5)
      .max(200)
      .required(),
    number: Joi.string()
      .pattern(/^[\w\d\s\-]+$/) // Aceita "123", "123-A", "s/n"
      .required(),
    city: Joi.string()
      .valid('Luanda', 'Benguela', 'Huambo', 'Lubango', 'Cabinda') // Principais cidades
      .required(),
    state: Joi.string()
      .valid(...provinces) // Somente códigos válidos
      .length(2)
      .required(),
    zipCode: Joi.string()
      .pattern(/^\d{4}-\d{3}$|^0000-000$/) // Formato angolano ou genérico
      .required()
  }).required(),

  category: Joi.string()
    .valid('eletrônicos', 'vestuário', 'alimento', 'outros', 'roupa')
    .required()
    .messages({
      'any.only': 'Categoria deve ser: eletrônicos, vestuário, alimento, outros ou roupa'
    }),

 contact: Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: [
            'com',    // Domínios internacionais
            'net',
            'org',
            'ao',     // Domínio nacional de Angola
            'co.ao',  // Domínio comercial angolano
            'ed.ao',  // Domínio educacional
            'gv.ao'   // Domínio governamental
          ],
          deny: ['ex']  // Domínios proibidos
        }
      })
      .required()
      .messages({
        'string.email': 'Formato de e-mail inválido. Use: usuario@provedor.ao',
        'string.empty': 'O e-mail é obrigatório'
      }),
    phone: Joi.string()
      .pattern(/^(\+244|\(244\))[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/)
      .required()
  }).required(),
  isActive: Joi.boolean()
    .default(true),

  // Campos opcionais
  additionalInfo: Joi.object({
    openingDate: Joi.date()
      .max('now'),
    hasPhysicalStore: Joi.boolean(),
    socialMedia: Joi.array()
      .items(Joi.string().uri())
  }).optional()
});

module.exports = storeSchema;