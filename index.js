import dotenv from "dotenv";
import app from "./src/modules/express.js";

dotenv.config();

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Rodando com express na porta ${port}!`);
});
