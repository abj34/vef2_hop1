import { body } from 'express-validator';
import { validationResult } from 'express-validator/src/validation-result.js';
import xss from 'xss';


export function validationCheck(req, res, next) {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        const errors = validation.array();
        const notFoundError = errors.find((error) => error.msg === 'not found');
        const serverError = errors.find((error) => error.msg === 'server error');

        let status = 400;

        if (serverError) {
            status = 500;
        } else if (notFoundError) {
            status = 404;
        }

        return res.status(status).json({ errors });
    }
    return next();
}

export const xssSanitizer = (param) =>
  body(param).customSanitizer((v) => xss(v));

export const genericSanitizerMany = (params) =>
  params.map((param) => body(param).customSanitizer((v) => xss(v)));

  export const usernameValidator = body('username')
  .isLength({ min: 1, max: 64 })
  .withMessage('username is required, max 64 characters');

  const isPatchingAllowAsOptional = (value, { req }) => {
    if (!value && req.method === 'PATCH') {
      return false;
    }
  
    return true;
  };

  export const emailValidator = body('email')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 64 })
  .isEmail()
  .withMessage('email is required, max 64 characters');

export const passwordValidator = body('password')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 8, max: 1128 })
  .withMessage('password is required, min 8 characters, max 128 characters');