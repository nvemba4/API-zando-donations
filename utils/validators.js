const { body, validationResult } = require("express-validator");

const passwordValidator = [
  body("password")
    .isLength( { min: 8 } ).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter (A-Z)")
    .matches(/[0-9]/).withMessage("Must contain at least one number (0-9)")
    .matches(/[^A-Za-z0-9]/).withMessage("Must contain at least one special character")
    .not().isIn(["password", "12345678", "qwerty123"]).withMessage("Password is too common"),
     body("displayName").notEmpty().trim().escape(),
     body("email").isEmail().normalizeEmail(),
     body("role").optional().isIn(["user", "admin"])
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const errorMessages = errors.array().map((err) => err.msg);
  return res.status(400).json( { errors: errorMessages } );
};

module.exports = { passwordValidator, validate };