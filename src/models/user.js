'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    usuario: String,
    password: String,
    following:[{
        user:String
    }],
    followers:[{
        user:String
    }],
    tweets:[{
        tweet:String,
        likes:[String],
        response:[{
            user:String,
            comentario:String
        }],
        reTweets:[String]
    }],
    reTweets:[{
        tweet:String,
        comentario:String
    }]
})

module.exports = mongoose.model('usuario',UsuarioSchema)