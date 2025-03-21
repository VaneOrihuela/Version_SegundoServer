const express = require("express");
const router = express.Router();

const TokenController =  require("../controladores/Token");

// Rutas Token
router.post("/token/data", TokenController.ObtenerDatosToken);
router.post("/token/validar-conexion", TokenController.ValidarConexion);



module.exports = router;