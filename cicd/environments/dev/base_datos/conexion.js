const oracledb = require('oracledb'); // ✅ Importar oracledb
require('dotenv').config();           // ✅ Cargar variables de entorno

const conexion = async () => {
    try {
        const conexionBd = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTSTRING,
        });
        console.log("Conexión a Oracle establecida correctamente.");
        return conexionBd;
    } catch (error) {
        console.error("Error al conectar a Oracle:", error.message);
        throw new Error('No se pudo conectar a la BD: ' + error.message);
    }
};

module.exports = {
    conexion
};