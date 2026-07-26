const { body } = require('express-validator');
const validate = require('./validate');

/**
 * User Input Validation Chains
 * 
 * Defines validation and sanitization rules for user registration payload
 * using express-validator. Enforces type safety, length bounds, and security best practices.
 */

/**
 * Validation rules for user registration payload
 */
const userRegistrationRules = [
  // 1. Full Name Validation
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .bail()
    .isString()
    .withMessage('Full name must be a text string')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('Full name must be between 3 and 50 characters'),

  // 2. Email Validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .bail()
    .isString()
    .withMessage('Email address must be a text string')
    .bail()
    .isLength({ max: 254 })
    .withMessage('Email address cannot exceed 254 characters')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .toLowerCase(),

  // 3. Password Validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a text string')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters long')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .bail()
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .bail()
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .bail()
    .matches(/[\W_]/)
    .withMessage('Password must contain at least one special character'),
];

/**
 * Validation rules for user login payload
 */
const userLoginRules = [
  // 1. Email Validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .bail()
    .isString()
    .withMessage('Email address must be a text string')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .toLowerCase(),

  // 2. Password Validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a text string'),
];

/**
 * Complete middleware array for validating user registration requests.
 * Combines field validation chains with the reusable error-formatting middleware.
 */
const validateUserRegistration = [
  ...userRegistrationRules,
  validate,
];

/**
 * Complete middleware array for validating user login requests.
 * Combines field validation chains with the reusable error-formatting middleware.
 */
const validateUserLogin = [
  ...userLoginRules,
  validate,
];

module.exports = {
  userRegistrationRules,
  validateUserRegistration,
  userLoginRules,
  validateUserLogin,
};
