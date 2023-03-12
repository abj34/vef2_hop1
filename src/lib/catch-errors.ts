import { Request, Response, NextFunction } from 'express';

export function catchErrors(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return (req: Request, res: Response, next: NextFunction) =>
        fn(req, res, next).catch(next);
}