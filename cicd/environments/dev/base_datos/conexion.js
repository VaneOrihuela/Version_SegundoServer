const oracledb = require('oracledb');

const conexion = async () => {
    var conexionBd;

    try {
        // Establecer conexión
        conexionBd = await oracledb.getConnection({
            user: 'APL_TRANSACTION',
            password: 'ApL_tRans4ct1on_2024',
            connectString: '172.16.202.9:1527/TXNMGRD',
        });
        return conexionBd;
    } catch (error) {
        throw new Error('No se pudo conectar a la BD');
    }
};

// Exportar la función para usarla en otros módulos
module.exports = {
    conexion
};