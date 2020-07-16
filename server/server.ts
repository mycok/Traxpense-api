import path from 'path';
import express from 'express';

// import devBundle from "./devBundle";
import template from '../template';

export const app: express.Express = express();
// devBundle.compile(app);

app.use(express.json());
app.use('/dist', express.static(path.join(process.cwd(), 'dist')));

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send(template());
});
