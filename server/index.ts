import express, { Express, Request, Response } from 'express';
import cors from 'cors';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const expressApp: Express = express();
expressApp.use(cors({ origin: true }));
expressApp.use(express.json());

expressApp.get('/health', async (req: Request, res: Response) => {
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io'
    }
  });

  const allUsers = await prisma.user.findMany({
    where: { email: 'alice@prisma.io' }
  });
  res.send({
    allUsers
  });
});

expressApp.listen(3000, () => {
  console.log('Server is running on port 3000');
});
