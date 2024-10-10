import type { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';

export const handleServerError = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // log the error
  req.log.error(err);

  // send the error response
  if (createError.isHttpError(err)) {
    res.status(err.statusCode).json({ code: err.statusCode, message: err.message });
  } else {
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
};
