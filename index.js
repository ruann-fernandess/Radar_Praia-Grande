import dotenv from "dotenv";
import app from "./src/modules/express.js";
import https from "https";
import fs from 'fs';
import chalk from 'chalk';

dotenv.config();

const port = process.env.PORT;

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
  }, app).listen(port, () => {
     console.log(chalk.magentaBright.bold(`Disponível em: https://localhost:8080/login.html (pode ser necessário autorizar entrada)`));
  })