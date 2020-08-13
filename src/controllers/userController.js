'use strict'

var bcrypt = require("bcrypt-nodejs");
var Usuario = require('../models/user')
var jwt = require("../services/jwt")



function registrarUsuario(user,password,res) {
    var usuario = new Usuario();

    if (user && password) {
        usuario.usuario = user
        //Consulta base de datos
        Usuario.find({ $or: [  
            { usuario : usuario.usuario}
        ]}).exec((err,usuarios)=>{
            if (err) return res.status(500).send({message : 'Error en la peticion del usuario'})

            if (usuarios && usuarios.length >= 1){
                return res.status(500).send({ message : 'El usuario ya existe'})
            }else{
                bcrypt.hash(password,null,null,(err,hash)=>{
                    usuario.password = hash;
                    
                    usuario.save((err,usuarioGuardado)=>{
                        if(err) return res.status(500).send({message : 'Error al guardar el usuario'})

                        if(usuarioGuardado){
                            res.status(200).send({user : usuarioGuardado})
                        }else{
                            res.status(404).send({message : 'No se ha podido registrar el usuario'})
                        }
                    })
                })
            }
        })
    }else{
        res.status(200).send({message : 'Rellene todos los datos necesarios'})
    }
}

function login(user,password,getToken,req,res){
    var params = req.body;
    
    Usuario.findOne({usuario: user}, (err,usuario)=>{
        if (err) return res.status(500).send({message: 'Error de peticion'})

        if (usuario) {
            bcrypt.compare(password,usuario.password,(err,check)=>{
                if (check) {
                    if (getToken) {
                        return res.status(200).send({
                            token: jwt.createToken(usuario)
                        })
                    }else{
                        usuario.password = undefined;
                        return res.status(200).send({usuario})
                    }
                }else{
                    return res.status(404).send({message: 'El usuario no se ha podido identificar'})
                }
            })
        }else{
            return res.status(404).send({message: 'El usuario no se ha podido logear'})
        }
    })

}

function profile(user,req,res) {

    var perfil = req.user.usuario

    if (user === perfil) {
        Usuario.findOne({'usuario':user},(err,data)=>{
            if(err) res.status(500).send({message:'Error en el perfil que desea ver'})
            if(!data) console.log('No puede ver el perfil de personas que no sigue o la persona que desea ver no existe')
            if(data){
                Usuario.findOne({usuario:user},(err,profile)=>{
                    if(err) res.status(500).send({message:'Error en elperfil del usuario que busca'})
                    if(!profile) res.status(404).send({message:'Error en el usuario'})
                    if(profile){
                        res.status(200).send({
                            usuario: profile.usuario,
                            tweets: profile.tweets.length,
                            reTweets:profile.reTweets.length,
                            following: profile.following.length,
                            followers:profile.followers.length
                        })
                    }
                })
            }
        })
    } else {
        Usuario.findOne({'following.user':user},(err,data)=>{
            if(err) res.status(500).send({message:'Error en el perfil que desea ver'})
            if(!data) res.status(404).send({message:'No puede ver el perfil de personas que no sigue o la persona que desea ver no existe'})
            if(data){
                Usuario.findOne({usuario:user},(err,profile)=>{
                    if(err) res.status(500).send({message:'Error en elperfil del usuario que busca'})
                    if(!profile) res.status(404).send({message:'Error en el usuario'})
                    if(profile){
                        res.status(200).send({
                            usuario: profile.usuario,
                            tweets: profile.tweets.length,
                            following: profile.following.length,
                            followers:profile.followers.length
                        })
                    }
                })
            }
        })
    }
}

module.exports ={
    login,
    registrarUsuario,
    profile

}