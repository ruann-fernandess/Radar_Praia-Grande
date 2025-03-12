const dotenv = require('dotenv')
const connectToDatabase = require('./src/database/connect')
require('./modules/express'); 
dotenv.config();
connectToDatabase();

