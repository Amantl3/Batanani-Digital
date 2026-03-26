import app from './app';
import dotenv from 'dotenv';

dotenv.config();

// Railway needs this to talk to the internet
const PORT = process.env.PORT || 8080;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 BOCRA Backend Live on Port ${PORT}`);
});