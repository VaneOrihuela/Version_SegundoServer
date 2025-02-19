const tokenModel = require("../modelos/TokenRequest");
const repositorio = require("../base_datos/Repositorio");
const { ConvertirToken } = require("./TokenParseBl");

// Función para convertir los datos a XML
const convertirAXML = (plantillasDatos) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Registros>\n';

    plantillasDatos.forEach((dato) => {
        xml += '  <Registro>\n';
        for (const key in dato) {
            if (dato[key] !== null) {
                xml += `    <${key}>${dato[key]}</${key}>\n`;
            } else {
                xml += `    <${key}/>\n`; // Etiqueta vacía si es null
            }
        }
        xml += '  </Registro>\n';
    });

    xml += '</Registros>';
    return xml;
};


const ObtenerDatosToken = async (req, res) => {

    var Request = req.body;
    try {   

        // asignar datos basados en el model
        const datos = await repositorio.obtenerTransacciones();
        const plantillasDatos = [];

        datos.forEach(dato => {
            const convertirToken = new ConvertirToken(dato.TOKEN_DATA);
            const resultadoSeparar = convertirToken.Separar();

            var esPrimerTipo = true;
            const resultadoConvertido = resultadoSeparar.map(token => {
                token.signoInicio = convertirToken.convertirHexAAscii(token.signoInicio);

                if (esPrimerTipo) {
                    token.longitud = convertirToken.convertirHexADecimal(token.tipo);
                    token.tipo = '';

                    esPrimerTipo = false;
                } else {
                    token.tipo = convertirToken.convertirHexAAscii(token.tipo);
                    token.longitud = convertirToken.convertirHexADecimal(token.longitud);
                    token.datos = convertirToken.convertirHexAAscii(token.datos);
                }

                return token;
            });            

            const plantillaDatos = {
                KQ2_ID_MEDIO_ACCESO: null,
                KQN_FLAG: null,
                KCH_RESP_SRC_RSN_CDE: null,
                KRJ_VERSION_3DS: null,
                KC0_IND_ECOM: null,
                KC0_CVV2: null,
                KC4_NIV_SEG: null,
                KC0_RESULTADO_VALIDACION_CAVV: null,
                KC4_ID_IND: null,
                KFH_ECOMM_3D_SECURE_IND: null,
                KFH_CAV_TYP: null,
                FECHA_TRASC:null,
                TIENDA_TERM:null,
                NUM_TARJETA:null,
                BOLETA:null
            };

            plantillaDatos.FECHA_TRASC = dato.FECHA_TRASC;
            plantillaDatos.TIENDA_TERM = dato.TIENDA_TERM;
            plantillaDatos.NUM_TARJETA = dato.NUM_TARJETA;
            plantillaDatos.BOLETA = dato.BOLETA;            

            resultadoConvertido.forEach(datoConvertido => {


                if (datoConvertido.tipo != null && datoConvertido.tipo != '') {
                    const esValorValido = (valor) => valor != null && valor !== '' && valor !== undefined;

                    switch (datoConvertido.tipo) {
                        case 'C0':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {

                                plantillaDatos.KC0_IND_ECOM = esValorValido(datoConvertido.datos[0][19]) ? datoConvertido.datos[0][19] : null; // posison 19
                                plantillaDatos.KC0_CVV2 = esValorValido(datoConvertido.datos[0][22]) ? datoConvertido.datos[0][22] : null; // posion 22
                                plantillaDatos.KC0_RESULTADO_VALIDACION_CAVV = esValorValido(datoConvertido.datos[0][26]) ? datoConvertido.datos[0][26] : null; // posion 26
                            }
                            break;
                        case 'Q2':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const acceso = datoConvertido.datos[0].slice(10, 12); // posicion 11 al 12 solo trae un 03 solo dos digitos y no son 12 como en la documentacion
                                plantillaDatos.KQ2_ID_MEDIO_ACCESO = esValorValido(acceso) ? acceso : null;   // posion 11  validar solo hay una longitud de dos y debe ser de 12                          
                            }
                            break;
                        case 'QN':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const flag = datoConvertido.datos[0].slice(0,2);
                                plantillaDatos.KQN_FLAG = esValorValido(flag) ? flag : null; // posicion 1      si sale correcto                       
                            }
                                break;
                         case 'CH':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                
                                plantillaDatos.KCH_RESP_SRC_RSN_CDE = esValorValido(datoConvertido.datos[0][1]) ? datoConvertido.datos[0][1] : null; // posison 1    En el token de ejemplo viene basio es correcto eso?                           
                            }
                                break;
                        case 'RJ':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const version3DS = datoConvertido.datos[0].slice(10, 12);// posion 11 y 12 viene vacio es correcto esto pero dice el docuemnto que no?
                                plantillaDatos.KRJ_VERSION_3DS = esValorValido(version3DS) ?version3DS : null;                               
                            }
                                break;
                        case 'C4':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                               
                                plantillaDatos.KC4_NIV_SEG = esValorValido(datoConvertido.datos[0][18]) ? datoConvertido.datos[0][18] : null; // posison 18 En token prosa dice que posicion 18 en BASE24  y son 12 como deice BASE24 se toma el 8 Cual es el del nivel de seguridad ?
                                plantillaDatos.KC4_ID_IND = esValorValido(datoConvertido.datos[0][11]) ? datoConvertido.datos[0][11] : null; // posison 11   // validar exactamente cual es?                
                            }
                                break;
                        case 'FH':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                               
                                plantillaDatos.KFH_ECOMM_3D_SECURE_IND = esValorValido(datoConvertido.datos[0][6]) ? datoConvertido.datos[0][6] : null; // posison 6 viene en blaco es correcto?
                                plantillaDatos.KFH_CAV_TYP = esValorValido(datoConvertido.datos[0][13]) ? datoConvertido.datos[0][13] : null; // posison 13     // esta en 8 es correcto documentacion dice otra cosa?                
                            }
                                break;
                        default:
                            break;
                    }
                }
            });
            // Agregar el objeto plantillaDatos a la lista plantillasDatos
            plantillasDatos.push(plantillaDatos);
            

        });
      
        const xmlResultado = convertirAXML(plantillasDatos);
        console.log(xmlResultado);

        const response = await repositorio.GuardarTransacciones(xmlResultado);
        // obtener datos.
        return res.status(200).send({
            data: "Guardado Correctamente",
            CantidadGuardadas:  response       
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