const tokenModel = require("../modelos/TokenRequest");
const repositorio = require("../base_datos/Repositorio");

const ObtenerDatosToken = async (req, res) => {
    // obtener parametros para la busqueda
    const errores = [];
    var Request = req.body;
    try {
        // validar datos en el modelo
        const errores = tokenModel.validate(Request);
        // Si hay errores, retornar una respuesta de error
        if (errores.length > 0) {
            return res.status(400).json({
                status: "Error",
                mensaje: "Validación fallida",
                errores,
            });
        }
        // crear objeto para buscar
        const parametrosBusqueda = {
            fechaTransaccion: Request.fechaTransaccion,
            tiendaTerminal: Request.tiendaTerminal,
            numeroTarjeta: Request.numeroTarjeta,
            boleta: Request.boleta,
        };

        // asignar datos basados en el model
        const dataToken = await repositorio.obtenerTransacciones(parametrosBusqueda);
        const tokenBuffer = Buffer.from(dataToken, 'hex');
        const tokenOriginal = tokenBuffer.toString('utf8');

        console.log(tokenOriginal);
        // obtener datos.
        return res.status(200).send({
            data: "esto es una prueba",
            token: dataToken,
            Request
        });
    }
    catch (error) {
        return res.status(500).json({
            status: "Error",
            mensaje: "Ocurrió un error en el servidor.",
            error: error.message
        });
    }


}

module.exports = {
    ObtenerDatosToken
};