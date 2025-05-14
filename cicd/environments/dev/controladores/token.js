const tokenBl = require("../logica/tokenBl");

const ObtenerDatosToken = async (req, res) => {
  return await tokenBl.ObtenerDatosToken(req, res);
};

const ValidarConexion = async (req, res) => {
  return await tokenBl.ValidarConexion(req, res);
};

module.exports = {
  ObtenerDatosToken,
  ValidarConexion
};