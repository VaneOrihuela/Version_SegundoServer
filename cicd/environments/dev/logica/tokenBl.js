
const repositorio = require("../base_datos/Repositorio");
const { ConvertirToken } = require("./TokenParseBl");



const generarXML = (plantillas) => {
  const seenMap = new Map();

  plantillas.forEach(dato => {
    // Crear una clave única
    const uniqueKey = `${dato.BOLETA}-${dato.NUMERO_TARJETA}-${dato.TIENDA_TERMINAL}-${dato.FECHA_TRANSACCION}`;

    if (!seenMap.has(uniqueKey)) {
      seenMap.set(uniqueKey, dato);
    }
  });

  // Obtener las transacciones únicas
  const uniquePlantillas = Array.from(seenMap.values());

  // Crear el XML manualmente
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Transacciones>\n';

  uniquePlantillas.forEach(dato => {
    xml += '  <Transaccion>\n';
    xml += `    <BOLETA>${dato.BOLETA || ''}</BOLETA>\n`;
    xml += `    <NUMERO_TARJETA>${dato.NUMERO_TARJETA || ''}</NUMERO_TARJETA>\n`;
    xml += `    <TIENDA_TERMINAL>${dato.TIENDA_TERMINAL || ''}</TIENDA_TERMINAL>\n`;
    xml += `    <FECHA_TRANSACCION>${dato.FECHA_TRANSACCION || ''}</FECHA_TRANSACCION>\n`;
    xml += '  </Transaccion>\n';
  });

  xml += '</Transacciones>';

  return xml;
};

const ObtenerDatosToken = async (req, res) => {

    var Request = req.body;
    try {   

        // asignar datos basados en el model
        const datos = await repositorio.obtenerTransacciones();
        const plantillasDatos = [];

        const startTime = Date.now();
        console.log(`Inicio del procesamiento ObtenerDatos de token: ${new Date(startTime).toLocaleString()}`);
        var count = 0;
        datos.forEach(dato => {
            count ++;
            console.log(`Token: ${count}`);           
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
                FECHA_TRANSACCION:null,
                TIENDA_TERMINAL:null,
                NUMERO_TARJETA:null,
                BOLETA:null
            };

            plantillaDatos.FECHA_TRANSACCION = dato.FECHA_TRASC;
            plantillaDatos.TIENDA_TERMINAL = dato.TIENDA_TERM;
            plantillaDatos.NUMERO_TARJETA = dato.NUM_TARJETA;
            plantillaDatos.BOLETA = dato.BOLETA;            

            resultadoConvertido.forEach(datoConvertido => {


                if (datoConvertido.tipo != null && datoConvertido.tipo != '') {
                    const esValorValido = (valor) => valor != null && valor !== '' && valor !== undefined;

                    switch (datoConvertido.tipo) {
                        case 'C0':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {

                                plantillaDatos.KC0_IND_ECOM = esValorValido(datoConvertido.datos[0][19]) ? datoConvertido.datos[0][19] : ' '; // posison 19
                                plantillaDatos.KC0_CVV2 = esValorValido(datoConvertido.datos[0][22]) ? datoConvertido.datos[0][22] : ' '; // posion 22
                                plantillaDatos.KC0_RESULTADO_VALIDACION_CAVV = esValorValido(datoConvertido.datos[0][26]) ? datoConvertido.datos[0][26] : ' '; // posion 26
                            }
                            break;
                        case 'Q2':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const acceso = datoConvertido.datos.slice(0,2); // 2 posiciones
                                plantillaDatos.KQ2_ID_MEDIO_ACCESO = esValorValido(acceso) ? acceso : '  ';   // posion 11  validar solo hay una longitud de dos y debe ser de 12                          
                            }
                            break;
                        case 'QN':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const flag = datoConvertido.datos.slice(0,1);
                                plantillaDatos.KQN_FLAG = esValorValido(flag) ? flag : ' '; // posicion 1      si sale correcto                       
                            }
                                break;
                         case 'CH':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                
                                plantillaDatos.KCH_RESP_SRC_RSN_CDE = esValorValido(datoConvertido.datos[0][1]) ? datoConvertido.datos[0][1] : ' '; // posison 1    En el token de ejemplo viene basio es correcto eso?                           
                            }
                                break;
                        case 'RJ':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const version3DS = datoConvertido.datos.slice(0, 2);// posion 11 y 12 viene vacio es correcto esto pero dice el docuemnto que no?
                                plantillaDatos.KRJ_VERSION_3DS = esValorValido(version3DS) ?version3DS : '  ';                               
                            }
                                break;
                        case 'C4':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                               
                                plantillaDatos.KC4_NIV_SEG = esValorValido(datoConvertido.datos[0][8]) ? datoConvertido.datos[0][8] : ' '; 
                                plantillaDatos.KC4_ID_IND = esValorValido(datoConvertido.datos[0][11]) ? datoConvertido.datos[0][11] : '0';            
                            }
                                break;
                        case 'FH':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                               // pendiente
                                plantillaDatos.KFH_ECOMM_3D_SECURE_IND = esValorValido(datoConvertido.datos[0][6]) ? datoConvertido.datos[0][6] : ' '; // posison 6 viene en blaco es correcto?
                                plantillaDatos.KFH_CAV_TYP = esValorValido(datoConvertido.datos[0][13]) ? datoConvertido.datos[0][13] : ''; // posison 13     // esta en 8 es correcto documentacion dice otra cosa?                
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
        console.log("plantilla",plantillasDatos);
        const endTime = Date.now();
        console.log(`Finaliza del procesamiento obtener datos token: ${new Date(endTime).toLocaleString()}`);
        const timeTakenInSeconds = (endTime - startTime) / 1000; // Tiempo en segundos
        const minutes = Math.floor(timeTakenInSeconds / 60); // Minutos
        const seconds = Math.floor(timeTakenInSeconds % 60); // Segundos

        console.log(`Tiempo de procesamiento: ${minutes} minutos y ${seconds} segundos.`);

        const esNuloOVacio = (valor) => {
            return valor == null || valor === '';  // Se considera nulo o vacío si es null o cadena vacía
          };
          
          const validarLongitud = (valor, maxLength) => {
            // Primero verificamos si el valor es nulo o vacío
            if (esNuloOVacio(valor)) {
              return false;  // No validamos longitud si es nulo o vacío
            }
            return valor.length > maxLength;  // Devuelve true si excede la longitud
          };
        const errores = []; 

        plantillasDatos.forEach(plantillaDatos => {
            // Validar cada campo y agregarlo al arreglo de errores si excede la longitud
            if (validarLongitud(plantillaDatos.KQ2_ID_MEDIO_ACCESO, 2)) {
              errores.push({ campo: 'KQ2_ID_MEDIO_ACCESO', valor: plantillaDatos.KQ2_ID_MEDIO_ACCESO });
            }
            if (validarLongitud(plantillaDatos.KQN_FLAG, 2)) {
              errores.push({ campo: 'KQN_FLAG', valor: plantillaDatos.KQN_FLAG });
            }
            if (validarLongitud(plantillaDatos.KCH_RESP_SRC_RSN_CDE, 2)) {
              errores.push({ campo: 'KCH_RESP_SRC_RSN_CDE', valor: plantillaDatos.KCH_RESP_SRC_RSN_CDE });
            }
            if (validarLongitud(plantillaDatos.KRJ_VERSION_3DS, 2)) {
              errores.push({ campo: 'KRJ_VERSION_3DS', valor: plantillaDatos.KRJ_VERSION_3DS });
            }
            if (validarLongitud(plantillaDatos.KC0_IND_ECOM, 2)) {
              errores.push({ campo: 'KC0_IND_ECOM', valor: plantillaDatos.KC0_IND_ECOM });
            }
            if (validarLongitud(plantillaDatos.KC0_CVV2, 4)) {
              errores.push({ campo: 'KC0_CVV2', valor: plantillaDatos.KC0_CVV2 });
            }
            if (validarLongitud(plantillaDatos.KC4_NIV_SEG, 1)) {
              errores.push({ campo: 'KC4_NIV_SEG', valor: plantillaDatos.KC4_NIV_SEG });
            }
            if (validarLongitud(plantillaDatos.KC0_RESULTADO_VALIDACION_CAVV, 1)) {
              errores.push({ campo: 'KC0_RESULTADO_VALIDACION_CAVV', valor: plantillaDatos.KC0_RESULTADO_VALIDACION_CAVV });
            }
            if (validarLongitud(plantillaDatos.KC4_ID_IND, 1)) {
              errores.push({ campo: 'KC4_ID_IND', valor: plantillaDatos.KC4_ID_IND });
            }
            if (validarLongitud(plantillaDatos.KFH_ECOMM_3D_SECURE_IND, 2)) {
              errores.push({ campo: 'KFH_ECOMM_3D_SECURE_IND', valor: plantillaDatos.KFH_ECOMM_3D_SECURE_IND });
            }
            if (validarLongitud(plantillaDatos.KFH_CAV_TYP, 2)) {
              errores.push({ campo: 'KFH_CAV_TYP', valor: plantillaDatos.KFH_CAV_TYP });
            }
            if (validarLongitud(plantillaDatos.FECHA_TRANSACCION, 20)) {
              errores.push({ campo: 'FECHA_TRANSACCION', valor: plantillaDatos.FECHA_TRANSACCION });
            }
            if (validarLongitud(plantillaDatos.TIENDA_TERMINAL, 20)) {
              errores.push({ campo: 'TIENDA_TERMINAL', valor: plantillaDatos.TIENDA_TERMINAL });
            }
            if (validarLongitud(plantillaDatos.NUMERO_TARJETA, 20)) {
              errores.push({ campo: 'NUMERO_TARJETA', valor: plantillaDatos.NUMERO_TARJETA });
            }
            if (validarLongitud(plantillaDatos.BOLETA, 20)) {
              errores.push({ campo: 'BOLETA', valor: plantillaDatos.BOLETA });
            }
            if (validarLongitud(plantillaDatos.TIPO, 20)) {
              errores.push({ campo: 'TIPO', valor: plantillaDatos.TIPO });
            }
          });

          console.log("Errores: ", errores);          
       
        const responseGuardado = await repositorio.GuardarTransacciones(plantillasDatos);
        const xml = generarXML(plantillasDatos);
        const responseModificar = await repositorio.ModificarTransaccionesFlag(xml);
        // obtener datos.
        return res.status(200).send({
            data: "Guardado Correctamente"           
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