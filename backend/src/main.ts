import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './adapters/config/createApp';

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Daviplata API ejecutandose en puerto ${PORT}`);
});

export default app;
