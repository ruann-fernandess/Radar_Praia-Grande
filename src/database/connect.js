const mongoose = require("mongoose");

const connectToDatabase = async () => {
  await mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cursonode.b6ajl.mongodb.net/?retryWrites=true&w=majority&appName=CursoNode`)
    .then(console.log('Conexão efetuada com sucesso!'))
    .catch(error => {
        console.log('Ocorreu um erro na conexão com o banco de dados. Erro:', error)
    })
};

module.exports = connectToDatabase;
