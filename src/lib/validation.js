import { body } from 'express-validator';
import { validationResult } from 'express-validator/src/validation-result.js';
import { findByUsername } from './users.js';
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
  .withMessage('notendanafn rangt, hámarki 64 stafir');

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
  .withMessage('email rangt, hámarki 64 stafir');

export const passwordValidator = body('password')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 8, max: 64 })
  .withMessage('lykilorð rangt,lágmarki 8 stafir, hámarki 64 stafir');

  export const nameValidator = body('name')
  .isLength({ min: 1, max: 64 })
  .withMessage('nafn rangt, hámarki 64 stafir');

  export const descriptionValidator = body('description')
  .isLength({ min: 1, max: 256 })
  .withMessage('lýsing röng, hámarki 256 stafir');

  export const titleValidator = body('title')
  .isLength({ min: 1, max: 64 })
  .withMessage('titill rangur, hámarki 64 stafir');  

  export const answerValidator = body('answer')
  .isLength({ min: 1, max: 64 })
  .withMessage('svar rangur, hámarki 64 stafir');  

  export const fakeanswer1Validator = body('fake_answer_1')
  .isLength({ min: 1, max: 64 })
  .withMessage('svar rangur, hámarki 64 stafir');  

  export const fakeanswer2Validator = body('fake_answer_2')
  .isLength({ min: 1, max: 64 })
  .withMessage('svar rangur, hámarki 64 stafir');  

  export const fakeanswer3Validator = body('fake_answer_3')
  .isLength({ min: 1, max: 64 })
  .withMessage('svar rangur, hámarki 64 stafir');  


  export const usernameDoesNotExistValidator = body('username').custom(
    async (username) => {
      const user = await findByUsername(username);
  
      if (user) {
        return Promise.reject(new Error('username already exists'));
      }
      return Promise.resolve();
    }
  );


