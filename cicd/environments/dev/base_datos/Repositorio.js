const conexion = require('./conexion');
const oracledb = require('oracledb');

const Repositorio = {
  verificarConexion: async (connection) => {
    try {
      await connection.execute('SELECT 1 FROM DUAL');
      return true;
    } catch (error) {
      console.error("La conexión está cerrada o no es válida:", error);
      return false;
    }
  },

  obtenerConexion: async () => {
    let connection = await conexion.conexion();
    const isConnectionActive = await Repositorio.verificarConexion(connection);
    if (!isConnectionActive) {
      console.log("Conexión cerrada. Intentando abrir una nueva...");
      connection = await conexion.conexion();
    }
    return connection;
  },

  ValidarConexion: async () => {
    let connection = await conexion.conexion();
    try {
      return await Repositorio.verificarConexion(connection);
    } catch (error) {
      console.error("Error al validar conexión:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error al cerrar la conexión:", err);
        }
      }
    }
  },

  obtenerTransacciones: async () => {
    let connection;
    try {
      connection = await Repositorio.obtenerConexion();
      const isConnectionActive = await Repositorio.verificarConexion(connection);
      if (!isConnectionActive) throw new Error('La conexión no está activa o se cerró');

      const query = `
        SELECT 
          TRAN_DAT AS FECHA_TRASC, 
          TERM_ID AS TIENDA_TERM, 
          CARD_NUM AS NUM_TARJETA, 
          ORIG_INVOICE_NUM AS BOLETA, 
          TOKEN_DATA,
          ENTRY_TIM,
          DAT_TIM,
          TRAN_TIM,
          AMT_1,
          TRAN_CDE_TC,
          TYP,
          APPRV_CDE,
          UIDT
        FROM (
          SELECT * FROM TRANSACCIONES 
          WHERE TOKEN_FLAG = 0 AND TOKEN_DATA IS NOT NULL AND UIDT IS NOT NULL
          ORDER BY UIDT
        )
        WHERE ROWNUM <= 5
      `;

      const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        resultSet: true,
        fetchArraySize: 1000
      };

      const result = await connection.execute(query, [], options);
      const resultSet = result.resultSet;

      const rows = [];
      let fetchedRows;
      do {
        fetchedRows = await resultSet.getRows(1000);
        rows.push(...fetchedRows);
      } while (fetchedRows.length > 0);

      await resultSet.close();
      return rows;
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
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
      if (!isConnectionActive) throw new Error('La conexión no está activa o se cerró');

      const query = `
        INSERT INTO INFO_TOKEN (
          KQ2_ID_MEDIO_ACCESO, KQN_FLAG, KCH_RESP_SRC_RSN_CDE, KRJ_VERSION_3DS,
          KC0_IND_ECOM, KC0_CVV2, KC4_NIV_SEG, KC0_RESULTADO_VALIDACION_CAVV,
          KC4_ID_IND, KFH_ECOMM_3D_SECURE_IND, KFH_CAV_TYP, FECHA_TRANSACCION,
          TIENDA_TERMINAL, NUMERO_TARJETA, BOLETA, TIPO, KB2_ARQC,
          KC4_TERM_ATTEND_IND, KC4_TERM_OPER_IND, KC4_TERM_LOC_IND,
          KC4_CRDHLDR_PRESENTIND, KC4_CRD_PRESENT_IND, KC4_CRD_CAPTR_IND,
          KC4_TXN_STAT_IND, KC4_TXN_RTN_IND, KC4_CRDHLDR_ACTVTTERM_IND,
          KC4_CRDHLDR_IDMETHOD, KR4_NUMERO_CONTRATO, KC5_TIPO_PAGO,
          ENTRY_TIM, DAT_TIM, TRAN_TIM, AMT_1, TRAN_CDE_TC, TYP, APPRV_CDE,
          UIDT_TRANSACCIONES
        ) VALUES (
          :KQ2_ID_MEDIO_ACCESO, :KQN_FLAG, :KCH_RESP_SRC_RSN_CDE, :KRJ_VERSION_3DS,
          :KC0_IND_ECOM, :KC0_CVV2, :KC4_NIV_SEG, :KC0_RESULTADO_VALIDACION_CAVV,
          :KC4_ID_IND, :KFH_ECOMM_3D_SECURE_IND, :KFH_CAV_TYP, :FECHA_TRANSACCION,
          :TIENDA_TERMINAL, :NUMERO_TARJETA, :BOLETA, '0', :KB2_ARQC,
          :KC4_TERM_ATTEND_IND, :KC4_TERM_OPER_IND, :KC4_TERM_LOC_IND,
          :KC4_CRDHLDR_PRESENTIND, :KC4_CRD_PRESENT_IND, :KC4_CRD_CAPTR_IND,
          :KC4_TXN_STAT_IND, :KC4_TXN_RTN_IND, :KC4_CRDHLDR_ACTVTTERM_IND,
          :KC4_CRDHLDR_IDMETHOD, :KR4_NUMERO_CONTRATO, :KC5_TIPO_PAGO,
          :ENTRY_TIM, :DAT_TIM, :TRAN_TIM, :AMT_1, :TRAN_CDE_TC, :TYP, :APPRV_CDE,
          :UIDT_TRANSACCIONES
        )
      `;

      const resultado = await connection.executeMany(query, plantillas, { autoCommit: true });
      console.log(`Número de filas insertadas: ${resultado.rowsAffected}`);
      return resultado.rowsAffected;
    } catch (error) {
      console.error("Error al guardar transacciones:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error al cerrar la conexión:", err);
        }
      }
    }
  },

  ModificarTransaccionesFlag: async () => {
    let connection;
    try {
      connection = await Repositorio.obtenerConexion();
      const isConnectionActive = await Repositorio.verificarConexion(connection);
      if (!isConnectionActive) throw new Error('La conexión no está activa o se cerró');

      const result = await connection.execute(
        `UPDATE TRANSACCIONES SET TOKEN_FLAG = 1 WHERE TOKEN_FLAG = 0`
      );

      await connection.commit();
      return result.rowsAffected;
    } catch (error) {
      console.error("Error al modificar flags de transacciones:", error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error al cerrar la conexión:", err);
        }
      }
    }
  }
};

module.exports = Repositorio;