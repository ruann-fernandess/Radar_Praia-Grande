import express from "express";
import { validarTokenConfirmarCadastro, validarTokenRedefinirSenha } from "../controller/tokenController.js";

const router = express.Router();

router.get("/validar-token-confirmar-cadastro/:token", validarTokenConfirmarCadastro);
router.get("/validar-token-redefinir-senha/:token", validarTokenRedefinirSenha);

export default router;
