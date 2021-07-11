import type { Request, Response, NextFunction } from 'express';

export const authorization = (req: Request, res: Response, next: NextFunction) => {
	if (!process.env.AUTH) return next();
	if (process.env.AUTH !== req.header('Authorization')) return res.sendStatus(400);

	return next();
};
