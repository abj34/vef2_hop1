import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator/src/validation-result.js';
import xss from 'xss';


export function validationCheck(req: Request, res: Response, next: NextFunction) {
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

export const xssSanitizer = (param: string) =>
  body(param).customSanitizer((v) => xss(v));

export const genericSanitizerMany = (params: string[]) =>
  params.map((param) => body(param).customSanitizer((v) => xss(v)));