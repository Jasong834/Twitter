'use strict'

//Variables Globales
const express = require("express")
const app = express();
const bodyparser = require("body-parser")

//Carga de rutas
var command_route = require("./routes/commandRoutes")


//MIDDLEWARES
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

//Cabeceras
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization,X-API-KEY,Origin,X-Requested-With,Accept,Access-Control-Allow-Request-Method')
    res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE')
    res.header('Allow','GET,POST,OPTIONS,PUT,DELETE')
    next();
})

//Rutas
app.use('/api',command_route)
//export
module.exports = app;
