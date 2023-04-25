import { Request, Response } from 'express';

export const updateUser = (req: Request, res: Response) => {
  console.log(req.body);
  res.send('Express + TypeScript Server');
};
