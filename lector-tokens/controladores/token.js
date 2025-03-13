const tokenBl =  require("../logica/tokenBl");

const ObtenerDatosToken = async (req,res)=>
{    // obtener parametros para la busqueda
    return await tokenBl.ObtenerDatosToken(req,res);
}
const ValidarConexion = async (req,res)=>
    {    // obtener parametros para la busqueda
        return await tokenBl.ValidarConexion(req,res);
    }

module.exports = {
    ObtenerDatosToken,
    ValidarConexion
};