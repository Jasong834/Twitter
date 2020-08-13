'use strict'
var loginContoller = require('./userController')
var tweetController = require('./tweetController')
var followController  = require('./followController')

function commands(req,res) {
    var params = req.body
    var command = params.commands
    var split_var = command.split(" ")
    var comando = split_var[0].toLowerCase();

    if(comando === 'register'){
        loginContoller.registrarUsuario(split_var[1],split_var[2],res)
    }else if(comando === 'login'){
        loginContoller.login(split_var[1],split_var[2],split_var[3],req,res)
    }else if(comando === 'add_tweet'){
        split_var.splice(0,1)

        var cadena = split_var.toString()

        var descripcion = cadena.replace(/,/g,' ')

        tweetController.addTweet(descripcion,req,res)

    }else if(comando === 'delete_tweet'){
        tweetController.deleteTweet(split_var[1],req,res)
    }else if(comando === 'edit_tweet'){

        var id = split_var[1]

        split_var.splice(0,1)

        split_var.splice(0,1)

        var cadena = split_var.toString()

        var descripcion = cadena.replace(/,/g,' ')

        console.log(descripcion)

        tweetController.editeTweet(id,descripcion,req,res)
    }else if(comando === 'view_tweets'){
        tweetController.viewTweets(split_var[1],req,res)
    }else if(comando === 'profile'){
        loginContoller.profile(split_var[1],req,res)
    }else if(comando === 'follow'){
        followController.follow(split_var[1],req,res)
    }else if(comando === 'unfollow'){
        followController.unfollow(split_var[1],req,res)
    }else if(comando === 'like_tweet'){
        tweetController.like(req,res,split_var[1])
    }else if(comando === 'dislike_tweet'){
        tweetController.disLike(req,res,split_var[1])
    }else if(comando === 'reply_tweet'){
        var id = split_var[1]
        split_var.splice(0,1)
        split_var.splice(0,1)

        var cadena = split_var.toString()

        var mensaje = cadena.replace(/,/g,' ')

        tweetController.response(req,res,id,mensaje)
    }else if(comando === 'retweet'){
        var id = split_var[1]
        split_var.splice(0,1)
        split_var.splice(0,1)

        var cadena = split_var.toString()
        var mensaje = cadena.replace(/,/g,' ')

        if(mensaje === ''){
            mensaje = null;
        }

        tweetController.reTweet(req,res,id,mensaje)
    }else{
        res.status(404).send({message:'Error en el commando'})
    }

}

module.exports= {
    commands
}