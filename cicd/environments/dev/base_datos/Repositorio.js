const conexion = require('./conexion');
const oracledb = require('oracledb');

const Repositorio = {
  // Función para verificar si la conexión está abierta
  verificarConexion: async (connection) => {
    try {
      // Realizamos una consulta sencilla para verificar si la conexión está activa
      await connection.execute('SELECT 1 FROM DUAL');
      return true; // Si la consulta pasa, la conexión está activa
    } catch (error) {
      console.error("La conexión está cerrada o no es válida:", error);
      return false; // Si ocurre un error, la conexión no es válida
    }
  },
  obtenerConexion: async () => {
    let connection = await conexion.conexion();  // Intentamos obtener la conexión

    const isConnectionActive = await Repositorio.verificarConexion(connection);

    // Si la conexión no está activa, la reabrimos
    if (!isConnectionActive) {
      console.log("Conexión cerrada. Intentando abrir una nueva...");
      connection = await conexion.conexion();
    }

    return connection;
  },
  ValidarConexion: async () =>{
      let connection = await conexion.conexion();
      try{

        return await Repositorio.verificarConexion(connection);

      }catch (error) {
        console.error("Error al obtener transacciones:", error);
        throw error;
      } finally {
        if (connection) {
          try {
            await connection.close(); // Aseguramos cerrar la conexión después de la consulta
          } catch (err) {
            console.error("Error al cerrar la conexión:", err);
          }
        }
      }

  },
  // Función para obtener transacciones con los parámetros proporcionados
  obtenerTransacciones: async () => {
    let connection;
    try {
      connection = await Repositorio.obtenerConexion();

      const isConnectionActive = await Repositorio.verificarConexion(connection);
      if (!isConnectionActive) {
        throw new Error('La conexión no está activa o se cerró');
      }
      // Query para obtener las transacciones basadas en los filtros ORDER BY TRAN_DAT DESC
      const query = `
      select 
        TRAN_DAT as FECHA_TRASC, 
        TERM_ID as TIENDA_TERM, 
        CARD_NUM as NUM_TARJETA, 
        ORIG_INVOICE_NUM as BOLETA, 
        DBMS_LOB.SUBSTR(TOKEN_DATA, 4000, 1) AS TOKEN_DATA
        from TRANSACCIONES 
      where  TOKEN_FLAG = 0 and  TOKEN_DATA is not null
      `;

      if (connection && connection.isClosed) {
        console.log('La conexión estaba cerrada, abriéndola de nuevo...');
        connection = await conexion.conexion();  // Reabrimos la conexión
      }

      // Configuración para mejorar rendimiento
      const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        resultSet: true,  // Usamos resultSet para mejorar la carga de datos
        fetchArraySize: 10000  // Traemos 5000 filas por lote en lugar del default (100)
      };

      const result = await connection.execute(query, [], options);
      const resultSet = result.resultSet;

      let rows = [];
      let batchSize = 100000; // Procesamos 10,000 filas por lote
      let fetchedRows;
      const startTime = Date.now();
      console.log(`Inicio del procesamiento: ${new Date(startTime).toLocaleString()}`);
      do {
        // Obtener 10,000 filas de golpe
        fetchedRows = await resultSet.getRows(batchSize);
        if (fetchedRows.length > 0) {
          // Añadir al array principal
          fetchedRows.forEach(row => {
            rows.push({
              FECHA_TRASC: row.FECHA_TRASC,
              TIENDA_TERM: row.TIENDA_TERM,
              NUM_TARJETA: row.NUM_TARJETA,
              BOLETA: row.BOLETA,
              TOKEN_DATA: row.TOKEN_DATA
            });
          });
          console.log(`✅ Procesados ${rows.length} registros...`);
        }
      } while (fetchedRows.length > 0); // Continuar hasta que no haya más filas
      const endTime = Date.now();
      console.log(`Inicio del procesamiento: ${new Date(endTime).toLocaleString()}`);
      const timeTakenInSeconds = (endTime - startTime) / 1000; // Tiempo en segundos
      const minutes = Math.floor(timeTakenInSeconds / 60); // Minutos
      const seconds = Math.floor(timeTakenInSeconds % 60); // Segundos

      console.log(`Tiempo de procesamiento: ${minutes} minutos y ${seconds} segundos.`);

      await resultSet.close();
      // Ejecutar la consulta con los parámetros proporcionados
      return rows;
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close(); // Aseguramos cerrar la conexión después de la consulta
        } catch (err) {
          console.error("Error al cerrar la conexión:", err);
        }
      }
    }
  },

  GuardarTransacciones: async (plantillas) => {
    let connection;
    try {
      connection = await Repositorio.obtenerConexion();

      const isConnectionActive = await Repositorio.verificarConexion(connection);
      if (!isConnectionActive) {
        throw new Error('La conexión no está activa o se cerró');
      }
      // Query para obtener las transacciones basadas en los filtros ORDER BY TRAN_DAT DESC
      const query = `    
            INSERT INTO INFO_TOKEN (
                KQ2_ID_MEDIO_ACCESO,
                KQN_FLAG,
                KCH_RESP_SRC_RSN_CDE,
                KRJ_VERSION_3DS,
                KC0_IND_ECOM,
                KC0_CVV2,
                KC4_NIV_SEG,
                KC0_RESULTADO_VALIDACION_CAVV,
                KC4_ID_IND,
                KFH_ECOMM_3D_SECURE_IND,
                KFH_CAV_TYP,
                FECHA_TRANSACCION,
                TIENDA_TERMINAL,
                NUMERO_TARJETA,
                BOLETA,
                TIPO
            ) VALUES (
                :KQ2_ID_MEDIO_ACCESO,
                :KQN_FLAG,
                :KCH_RESP_SRC_RSN_CDE,
                :KRJ_VERSION_3DS,
                :KC0_IND_ECOM,
                :KC0_CVV2,
                :KC4_NIV_SEG,
                :KC0_RESULTADO_VALIDACION_CAVV,
                :KC4_ID_IND,
                :KFH_ECOMM_3D_SECURE_IND,
                :KFH_CAV_TYP,
                :FECHA_TRANSACCION,
                :TIENDA_TERMINAL,
                :NUMERO_TARJETA,
                :BOLETA,
                '0'
            )    
      `;

      if (connection && connection.isClosed) {
        console.log('La conexión estaba cerrada, abriéndola de nuevo...');
        connection = await conexion.conexion();  // Reabrimos la conexión
      }
      // Ejecutar la consulta con los parámetros proporcionados
      const resultado = await connection.executeMany(query, plantillas, { autoCommit: true });
      
      console.log(`Número de filas insertadas: ${resultado.rowsAffected}`);
      return resultado.rowsAffected;
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close(); // Aseguramos cerrar la conexión después de la consulta
        } catch (err) {
          console.error("Error al cerrar la conexión:", err);
        }
      }
    }
  },
  ModificarTransaccionesFlag: async (xml) => {
    let connection;    
    try {
      connection = await Repositorio.obtenerConexion();

      const isConnectionActive = await Repositorio.verificarConexion(connection);
      if (!isConnectionActive) {
        throw new Error('La conexión no está activa o se cerró');
      }   

      
        //const query = `BEGIN transacciones_pkg.actualizar_token_flag(:p_xml); END;`;
        //const binds = { p_xml: { val: xml, type: oracledb.CLOB } };

        const result = await connection.execute(
          `UPDATE TRANSACCIONES
           SET TOKEN_FLAG = 1
           WHERE TOKEN_FLAG = 0`
        );

        // Ejecutar el batch de la consulta
        //await connection.execute(query, binds, { autoCommit: true });  

        // Realizar commit intermedio después de cada lote
        await connection.commit();
        return result.rowsAffected;
     
    } catch (error) {
      console.error("Error al ejecutar  UPDATE masivo:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close(); // Aseguramos cerrar la conexión después de la consulta
        } catch (err) {
          console.error("Error al cerrar la conexión:", err);
        }
      }
    }
  }

};

module.exports = Repositorio;
