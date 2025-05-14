const repositorio = require("../base_datos/Repositorio");

const ObtenerDatosToken = async (req, res) => {
  try {
    const datos = await repositorio.obtenerTransacciones();
    return res.status(200).json({ datos });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error en tokenBl",
      error: error.message
    });
  }
};

const ValidarConexion = async (req, res) => {
  try {
    const estado = await repositorio.ValidarConexion();
    return res.status(200).json({ conexion: estado });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al validar conexión",
      error: error.message
    });
  }
};

module.exports = {
  ObtenerDatosToken,
  ValidarConexion
};