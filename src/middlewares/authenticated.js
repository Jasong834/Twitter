'use strict'

var jwt = require("jwt-simple")
var moment = require("moment")
var secret = 'clave_secreta_IN6BM'

exports.ensureAuth = function (req,res,next) {

    var params = req.body;
    var command = params.commands
    var split_var = command.split(" ")
    var comando = split_var[0].toLowerCase();
    


    if(!req.headers.authorization && comando != 'register' && comando != 'login'){
        return res.status(403).send({message : 'La peticion no tienen la cabecera de autenticacion o no esta logeado'})
    }


    if(req.headers.authorization){

        var token = req.headers.authorization.replace(/['"]+/g,'')
    
        try {
            var payload = jwt.decode(token,secret)
    
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({message: 'El token ha expirado'})
            }
    
        } catch (ex) {
        
            res.status(404).send({message: 'El token no es valido'})
    
        }
    }


    req.user = payload;
    next();
}