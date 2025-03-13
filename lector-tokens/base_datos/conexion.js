const oracledb = require('oracledb');
// require('dotenv').config();


const conexion = async () => {
    var conexionBd;

    try {
        // Establecer conexión
        conexionBd = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTSTRING,
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