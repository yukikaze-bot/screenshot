import type { Request, Response, NextFunction } from 'express';
import { fetchNsfwList } from '../utils/fetchNsfwList';
import { parse } from 'url';

export const checkNsfw = async (req: Request, res: Response, next: NextFunction) => {
	const check = req.query.checkNsfw;

	if (check !== 'yes') return next();

	const list = await fetchNsfwList();
	const url = req.query.url as string;

	if (!url) return res.sendStatus(400);

	const parsed = parse(url);

	if (list.some((uri) => parsed.host === uri)) return res.sendStatus(403);

	return next();
};
