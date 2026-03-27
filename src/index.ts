import dotenv from 'dotenv';
dotenv.config();

import app from './app';

// Railway provides the PORT environment variable automatically
const PORT = process.env.PORT || 8080;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(` BOCRA Backend Live on Port ${PORT}`);
});
