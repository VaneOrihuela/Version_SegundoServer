const {conexion} = require("./base_datos/conexion")
const express = require("express");
const cors = require("cors");
const { DATE } = require("oracledb");

console.log("Arranca node");

//Concetar a la base de datos
conexion();
//creacion de servidor node
const app = express();
const puerto = 5001;
// configurar cors
app.use(cors());
app.use(express.json());// recibe json
app.use(express.urlencoded({extended:true}));// recibe tambien form url encode

// rutas pruebas

const rutas_token = require("./rutas/token");
app.use("/api",rutas_token);

// crear servidor y escuchar peticiones http
app.listen(puerto, ()=>{
    console.log("servidor corriendo en el puerto " + puerto);
});