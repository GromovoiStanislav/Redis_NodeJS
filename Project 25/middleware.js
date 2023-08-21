import { nanoid } from 'nanoid';

export function middleware(req, res, next) {
  const userId = req.cookies['userId'];

  if (!userId) {
    res.cookie('userId', nanoid());
  }

  next();
}