
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
        for (const dato of datos) {
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
                    if(token.tipo === 'B2')
                      {
                        console.log(token.datos);
                      }
                    else
                    {
                      token.datos = convertirToken.convertirHexAAscii(token.datos);
                    }
                    token.longitud = convertirToken.convertirHexADecimal(token.longitud);
                    
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
                BOLETA:null,
                KB2_ARQC:null,
                KC4_TERM_ATTEND_IND:null,
                KC4_TERM_OPER_IND:null,
                KC4_TERM_LOC_IND:null,
                KC4_CRDHLDR_PRESENTIND:null,
                KC4_CRD_PRESENT_IND:null,
                KC4_CRD_CAPTR_IND:null,
                KC4_TXN_STAT_IND:null,
                KC4_TXN_RTN_IND:null,
                KC4_CRDHLDR_ACTVTTERM_IND:null,
                KC4_CRDHLDR_IDMETHOD:null,
                KR4_NUMERO_CONTRATO:null,
                KC5_TIPO_PAGO:null,
                ENTRY_TIM:null,
                DAT_TIM:null,
                TRAN_TIM:null,
                AMT_1:null,
                TRAN_CDE_TC:null,
                TYP:null,
                APPRV_CDE:null
            };

            plantillaDatos.FECHA_TRANSACCION = dato.FECHA_TRASC;
            plantillaDatos.TIENDA_TERMINAL = dato.TIENDA_TERM;
            plantillaDatos.NUMERO_TARJETA = dato.NUM_TARJETA;
            plantillaDatos.BOLETA = dato.BOLETA;
            plantillaDatos.ENTRY_TIM= dato.ENTRY_TIM;
            plantillaDatos.DAT_TIM= dato.DAT_TIM;
            plantillaDatos.TRAN_TIM= dato.TRAN_TIM;
            plantillaDatos.AMT_1= dato.AMT_1;
            plantillaDatos.TRAN_CDE_TC= dato.TRAN_CDE_TC;
            plantillaDatos.TYP= dato.TYP;
            plantillaDatos.APPRV_CDE = dato.APPRV_CDE;    

            for (const datoConvertido of resultadoConvertido) {


                if (datoConvertido.tipo != null && datoConvertido.tipo != '') {
                    const esValorValido = (valor) => valor != null && valor !== '' && valor !== undefined;

                    switch (datoConvertido.tipo) {
                        case 'C0':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                plantillaDatos.KC0_IND_ECOM = esValorValido(datoConvertido.datos[18]) ? datoConvertido.datos[18] : ' '; // posison 19
                                plantillaDatos.KC0_CVV2 = esValorValido(datoConvertido.datos[21]) ? datoConvertido.datos[21] : ' '; // posion 22
                                plantillaDatos.KC0_RESULTADO_VALIDACION_CAVV = esValorValido(datoConvertido.datos[25]) ? datoConvertido.datos[25] : ' '; // posion 26
                            }
                            break;
                        case 'Q2':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const acceso = datoConvertido.datos.slice(4,6); // 2 posiciones
                                plantillaDatos.KQ2_ID_MEDIO_ACCESO = esValorValido(acceso) ? acceso : '  ';   // posion 11  validar solo hay una longitud de dos y debe ser de 12                          
                            }
                            break;
                        case 'QN':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                const flag = datoConvertido.datos.slice(0,2);
                                plantillaDatos.KQN_FLAG = esValorValido(flag) ? flag : ' '; // posicion 1  y 2    si sale correcto                       
                            }
                                break;
                         case 'CH':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                
                                plantillaDatos.KCH_RESP_SRC_RSN_CDE = esValorValido(datoConvertido.datos[0]) ? datoConvertido.datos[0] : ' '; // posison 1    En el token de ejemplo viene basio es correcto eso?                           
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
                                plantillaDatos.KC4_TERM_ATTEND_IND = esValorValido(datoConvertido.datos[0]) ? datoConvertido.datos[0] : ' '; // Posision 1  The Terminal attendance indicator indicates if the terminal is attended by the card acceptor.
                                plantillaDatos.KC4_TERM_OPER_IND = esValorValido(datoConvertido.datos[1]) ? datoConvertido.datos[1] : ' '; // posicion 2  The Terminal Operator Indicator is currently not being used. The field is zero filled.}
                                plantillaDatos.KC4_TERM_LOC_IND = esValorValido(datoConvertido.datos[2]) ? datoConvertido.datos[2] : ' ';// posicion 3 The Terminal Location Indicator indicates the location of the terminal.
                                plantillaDatos.KC4_CRDHLDR_PRESENTIND = esValorValido(datoConvertido.datos[3]) ? datoConvertido.datos[3] : ' '; // posicion 4 The Cardholder Presence Indicator indicates whether the cardholder is present at the POS and explains the condition if the cardholder is not present.
                                plantillaDatos.KC4_CRD_PRESENT_IND = esValorValido(datoConvertido.datos[4]) ? datoConvertido.datos[4] : ' ';// posicion 5 The Card Presence Indicator indicates if the card is present at the POS.
                                plantillaDatos.KC4_CRD_CAPTR_IND = esValorValido(datoConvertido.datos[5]) ? datoConvertido.datos[5] : ' ';// posicion 6 The Card Capture Indicator indicates whether the terminal has card capture capabilities.
                                plantillaDatos.KC4_TXN_STAT_IND = esValorValido(datoConvertido.datos[6]) ? datoConvertido.datos[6] : ' ';// posicion 7 The Transaction Status Indicator indicates the purpose or status of the request.

                                plantillaDatos.KC4_NIV_SEG = esValorValido(datoConvertido.datos[7]) ? datoConvertido.datos[7] : ' '; // posicion 8 nivel de seguridad

                                plantillaDatos.KC4_TXN_RTN_IND = esValorValido(datoConvertido.datos[8]) ? datoConvertido.datos[8] : ' '; // posicion 9 The Transaction Routing Indicator is currently not being used
                                plantillaDatos.KC4_CRDHLDR_ACTVTTERM_IND = esValorValido(datoConvertido.datos[9]) ? datoConvertido.datos[9] : ' ';// posicion 10 The Cardholder Activated Terminal Indicator indicates whether the cardholder activated the terminal with the use of the card and the CAT security level.
                                
                                plantillaDatos.KC4_ID_IND = esValorValido(datoConvertido.datos[10]) ? datoConvertido.datos[10] : '0'; //    posicion 11  -- Ind. Cap.para trans. datos de la tarjeta a la term.
                                
                                plantillaDatos.KC4_CRDHLDR_IDMETHOD = esValorValido(datoConvertido.datos[11]) ?datoConvertido.datos[11] : '  '; //  posicion 12 This field reflects how the cardholder was verified.
                            }
                                break;
                        case 'FH':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                               // pendiente
                                plantillaDatos.KFH_ECOMM_3D_SECURE_IND = esValorValido(datoConvertido.datos[5]) ? datoConvertido.datos[5] : ' '; // posison 6 viene en blaco es correcto?
                                plantillaDatos.KFH_CAV_TYP = esValorValido(datoConvertido.datos[12]) ? datoConvertido.datos[12] : ''; // posison 13     // esta en 8 es correcto documentacion dice otra cosa?                
                            }
                                break;
                        case 'B2':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                 const arqc = datoConvertido.datos.slice(31,47); // 16 posiciones                                
                                plantillaDatos.KB2_ARQC = esValorValido(arqc) ? arqc : '               '; // posison 16 viene en blaco es correcto?
                            }
                                break;
                        case 'R4':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                                 // 20 posiciones   
                                 const numeroContrato = datoConvertido.datos.slice(0,20);                              
                                plantillaDatos.KR4_NUMERO_CONTRATO = esValorValido(numeroContrato) ? numeroContrato : '                   '; // posison 1 a la 20  viene en blaco es correcto?
                            }
                                break;
                        case 'C5':
                            if (datoConvertido.datos != null && datoConvertido.datos != '' && datoConvertido.datos != undefined) {
                              const tipoPago = datoConvertido.datos.slice(56,58);                                                        
                                plantillaDatos.KC5_TIPO_PAGO = esValorValido(tipoPago) ? tipoPago : '  '; // posison 16 viene en blaco es correcto?
                            }
                                break;
                        default:
                            break;
                    }
                }
            };            // Agregar el objeto plantillaDatos a la lista plantillasDatos
            plantillasDatos.push(plantillaDatos);
        };
        
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

        for (const p of plantillasDatos) {
          if (validarLongitud(p.KQ2_ID_MEDIO_ACCESO, 2)) errores.push({ campo: 'KQ2_ID_MEDIO_ACCESO', valor: p.KQ2_ID_MEDIO_ACCESO });
          if (validarLongitud(p.KQN_FLAG, 2)) errores.push({ campo: 'KQN_FLAG', valor: p.KQN_FLAG });
          if (validarLongitud(p.KCH_RESP_SRC_RSN_CDE, 2)) errores.push({ campo: 'KCH_RESP_SRC_RSN_CDE', valor: p.KCH_RESP_SRC_RSN_CDE });
          if (validarLongitud(p.KRJ_VERSION_3DS, 2)) errores.push({ campo: 'KRJ_VERSION_3DS', valor: p.KRJ_VERSION_3DS });
          if (validarLongitud(p.KC0_IND_ECOM, 2)) errores.push({ campo: 'KC0_IND_ECOM', valor: p.KC0_IND_ECOM });
          if (validarLongitud(p.KC0_CVV2, 4)) errores.push({ campo: 'KC0_CVV2', valor: p.KC0_CVV2 });
          if (validarLongitud(p.KC4_NIV_SEG, 1)) errores.push({ campo: 'KC4_NIV_SEG', valor: p.KC4_NIV_SEG });
          if (validarLongitud(p.KC0_RESULTADO_VALIDACION_CAVV, 1)) errores.push({ campo: 'KC0_RESULTADO_VALIDACION_CAVV', valor: p.KC0_RESULTADO_VALIDACION_CAVV });
          if (validarLongitud(p.KC4_ID_IND, 1)) errores.push({ campo: 'KC4_ID_IND', valor: p.KC4_ID_IND });
          if (validarLongitud(p.KFH_ECOMM_3D_SECURE_IND, 2)) errores.push({ campo: 'KFH_ECOMM_3D_SECURE_IND', valor: p.KFH_ECOMM_3D_SECURE_IND });
          if (validarLongitud(p.KFH_CAV_TYP, 2)) errores.push({ campo: 'KFH_CAV_TYP', valor: p.KFH_CAV_TYP });
          if (validarLongitud(p.FECHA_TRANSACCION, 20)) errores.push({ campo: 'FECHA_TRANSACCION', valor: p.FECHA_TRANSACCION });
          if (validarLongitud(p.TIENDA_TERMINAL, 20)) errores.push({ campo: 'TIENDA_TERMINAL', valor: p.TIENDA_TERMINAL });
          if (validarLongitud(p.NUMERO_TARJETA, 20)) errores.push({ campo: 'NUMERO_TARJETA', valor: p.NUMERO_TARJETA });
          if (validarLongitud(p.BOLETA, 20)) errores.push({ campo: 'BOLETA', valor: p.BOLETA });
          if (validarLongitud(p.KB2_ARQC, 16)) errores.push({ campo: 'KB2_ARQC', valor: p.KB2_ARQC });
          if (validarLongitud(p.KC4_TERM_ATTEND_IND, 1)) errores.push({ campo: 'KC4_TERM_ATTEND_IND', valor: p.KC4_TERM_ATTEND_IND });
          if (validarLongitud(p.KC4_TERM_OPER_IND, 1)) errores.push({ campo: 'KC4_TERM_OPER_IND', valor: p.KC4_TERM_OPER_IND });
          if (validarLongitud(p.KC4_TERM_LOC_IND, 1)) errores.push({ campo: 'KC4_TERM_LOC_IND', valor: p.KC4_TERM_LOC_IND });
          if (validarLongitud(p.KC4_CRDHLDR_PRESENTIND, 1)) errores.push({ campo: 'KC4_CRDHLDR_PRESENTIND', valor: p.KC4_CRDHLDR_PRESENTIND });
          if (validarLongitud(p.KC4_CRD_PRESENT_IND, 1)) errores.push({ campo: 'KC4_CRD_PRESENT_IND', valor: p.KC4_CRD_PRESENT_IND });
          if (validarLongitud(p.KC4_CRD_CAPTR_IND , 1)) errores.push({ campo: 'KC4_CRD_CAPTR_IND ', valor: p.KC4_CRD_CAPTR_IND  });
          if (validarLongitud(p.KC4_TXN_STAT_IND, 1)) errores.push({ campo: 'KC4_TXN_STAT_IND', valor: p.KC4_TXN_STAT_IND });
          if (validarLongitud(p.KC4_TXN_RTN_IND, 1)) errores.push({ campo: 'KC4_TXN_RTN_IND', valor: p.KC4_TXN_RTN_IND });
          if (validarLongitud(p.KC4_CRDHLDR_ACTVTTERM_IND, 1)) errores.push({ campo: 'KC4_CRDHLDR_ACTVTTERM_IND', valor: p.KC4_CRDHLDR_ACTVTTERM_IND });
          if (validarLongitud(p.KC4_CRDHLDR_IDMETHOD, 1)) errores.push({ campo: 'KC4_CRDHLDR_IDMETHOD', valor: p.KC4_CRDHLDR_IDMETHOD });
          if (validarLongitud(p.KR4_NUMERO_CONTRATO, 20)) errores.push({ campo: 'KR4_NUMERO_CONTRATO', valor: p.KR4_NUMERO_CONTRATO });
          if (validarLongitud(p.KC5_TIPO_PAGO, 2)) errores.push({ campo: 'KC5_TIPO_PAGO', valor: p.KC5_TIPO_PAGO });
      }

      if (errores.length > 0) {
        console.log("Errores de validación:", errores);
      }                
       
       const responseGuardado = await repositorio.GuardarTransacciones(plantillasDatos);
        const xml = generarXML(plantillasDatos);
        const responseModificar = await repositorio.ModificarTransaccionesFlag(xml);

        const endTimeAll = Date.now();
        console.log(`Inicio del procesamiento ObtenerDatos de token: ${new Date(startTime).toLocaleString()}`);
        console.log(`Finaliza del procesamiento obtener datos token: ${new Date(endTimeAll).toLocaleString()}`);
        const timeTakenInSecondsAll = (endTimeAll - startTime) / 1000; // Tiempo en segundos
        const minutesAll = Math.floor(timeTakenInSecondsAll / 60); // Minutos
        const secondsAll = Math.floor(timeTakenInSecondsAll % 60); // Segundos

        console.log(`Tiempo de procesamiento total: ${minutesAll} minutos y ${secondsAll} segundos.`);
        // obtener datos.
        return res.status(200).send({            
            version: "1.0.0", 
            exitoso: true         
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

const ValidarConexion = async (req, res) => {

  var Request = req.body;
  try {   

    const conexion = await repositorio.ValidarConexion(); 
    
    if(!conexion)
    {
      return res.status(500).json({
        status: "Error",
        mensaje: "No hay conexion a la base.",
        error: "Se valido y no hay conexion a la base valide las credenciales y si tiene permisos.",
        exitoso:conexion
      });

    }
      // obtener datos.ValidarConexion
      return res.status(200).send({
          data: "Conexion Correctamente a la base",
          exitoso:conexion          
      });
  }
  catch (error) {
      return res.status(500).json({
          status: "Error",
          mensaje: "Ocurrió un error en el servidor.",
          error: error.message,
          exitoso:false
      });
  }
}


module.exports = {
    ObtenerDatosToken,
    ValidarConexion
};