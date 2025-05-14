const express = require("express");
const cors = require("cors");
const { conexion } = require("./base_datos/conexion");

console.log("Arranca node");

conexion()
  .then(() => {
    console.log("✅ Conexión a Oracle establecida correctamente.");

    const app = express();
    const puerto = 5001;

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const rutas_token = require("./rutas/token");
    app.use("/api", rutas_token);

    app.listen(puerto, () => {
      console.log("Servidor corriendo en el puerto", puerto);
    });
  })
  .catch((error) => {
    console.error("❌ Fallo al conectar a Oracle:", error.message);
  });