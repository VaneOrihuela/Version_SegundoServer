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
  // Función para obtener transacciones con los parámetros proporcionados
  obtenerTransacciones: async ({ fechaTransaccion, tiendaTerminal, numeroTarjeta, boleta }) => {
    let connection;
    try {
        connection = await Repositorio.obtenerConexion();

      const isConnectionActive = await Repositorio.verificarConexion(connection);
      if (!isConnectionActive) {
        throw new Error('La conexión no está activa o se cerró');
      }
      // Query para obtener las transacciones basadas en los filtros
      const query = `
        SELECT TOKEN_DATA
        FROM TRANSACCIONES
        WHERE TRAN_DAT = :fechaTransaccion
          AND TERM_ID = :tiendaTerminal
          AND CARD_NUM = :numeroTarjeta
          AND ORIG_INVOICE_NUM = :boleta
      `;
      if (connection && connection.isClosed) {
        console.log('La conexión estaba cerrada, abriéndola de nuevo...');
        connection = await conexion.conexion();  // Reabrimos la conexión
      }
      // Ejecutar la consulta con los parámetros proporcionados
      const resultado = await connection.execute(
        query,
        { fechaTransaccion, tiendaTerminal, numeroTarjeta, boleta }, // Aquí pasamos los valores de los parámetros
        { outFormat: oracledb.OUT_FORMAT_OBJECT } // Definimos el formato de salida como objetos
      );
     
      // Verificamos si obtenemos resultados
      if (resultado.rows.length > 0) {        
        return resultado.rows[0].TOKEN_DATA;
      } else {        
        return null;
      }
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

};

module.exports = Repositorio;
