const tokenBl =  require("../logica/tokenBl");

const ObtenerDatosToken = async (req,res)=>
{    // obtener parametros para la busqueda
    return await tokenBl.ObtenerDatosToken(req,res);   
}

module.exports = {    
    ObtenerDatosToken
};