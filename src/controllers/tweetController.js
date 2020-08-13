'use strict'

var User = require('../models/user')
var ObjectId = require('mongoose').Types.ObjectId;

function addTweet(descripcion,req,res) {

    var idUser = req.user.sub
    
    
    User.findById(idUser,(err,usuario)=>{
        if(err) res.status(500).send({message:'Error en el usuario que desea publiar el tweet'})
        if(!usuario) res.status(404).send({message:'Error en el usuario o no esta logeado actuamente'})
        if(usuario){
            User.findByIdAndUpdate(idUser,{$push:{tweets:{tweet:descripcion}}},{new:true},(err,tweet)=>{
                if(err) res.status(404).send({message:'Error al agregar el tweet'})
                if(tweet) res.status(200).send({message:tweet})
            })
        }
    })

}

function deleteTweet(id,req,res) {
    var idUser = req.user.sub

    User.findOne({'_id':idUser},{tweets:{$elemMatch:{'_id':id}}},(err,tweet)=>{
        if(err) res.status(404).send({message:'Error en el tweet que desea eliminar'})
        if(tweet.tweets.length === 0){
            res.status(404).send({message:'Error al eliminar el tweet deseado o no posee permisos para hacerlo'})
        }else if(tweet.tweets != 0){
            User.findOneAndUpdate({'_id':idUser},{'$pull':{tweets:{_id:id}}},{new:true},(err,tweet)=>{
                if(err) res.status(500).send({message:'Error en eliminar el tweet'})
                if(!tweet) res.status(404).send({message:'Error en el usuario o no esta logeado actuamente'})
                if(tweet) res.status(200).send({tweet}) 
            })
        }
    })
}

function editeTweet(id,descripcion,req,res) {
    var idUser = req.user.sub
    
    User.findOneAndUpdate({'_id':idUser,'tweets._id':id},{'$set':{'tweets.$.tweet':descripcion}},{new:true},(err,tweet)=>{
        if(err) res.status(500).send({message:'Error en editar el tweet'})
        if(!tweet) res.status(404).send({message:'Error al editar el tweet deseado o no posee permisos para hacerlo'})
        if(tweet) res.status(200).send({tweet}) 
    })

}



function like(req,res,idTweet) {
    var idUser = req.user.sub
    var tweetUser ;
    var dueno;

    User.findOne({'tweets._id':idTweet},(err,user)=>{
        if (user) {
            tweetUser  = user.usuario;
            dueno = user._id
            User.findOne({'following.user':tweetUser},(err,userFollowing)=>{
                if(userFollowing){
                    User.aggregate([
                        {$match : {'_id':dueno}},
                        {$project: {
                            tweets : {$filter: {
                                input: '$tweets',
                                as: 'tweet',
                                cond: {$and: [
                                    {$eq : ['$$tweet._id', ObjectId(idTweet)]},
                                    {$in: [idUser, '$$$tweet.likes']}
                                ]}
                            }}
                        }}
                    ],(err,users)=>{
                        //console.log(JSON.stringify(users))
                        if(users && users.length && users[0].tweets && users[0].tweets.length){
                            res.status(404).send({message:'Ya posee like en el tweet deseado'})
                        }else {
                            User.findOneAndUpdate({'tweets._id':idTweet},{$push:{'tweets.$.likes':idUser}},{new:true},(err,like)=>{
                                if(err) return res.status(500).send({message:'Error en el tweet o id equivocado'})
                                if(!like) return res.status(404).send({message:'Error al agregar el tweet'})
                                return res.status(200).send({tweet:like.tweets})
                            })
                        }

                        if(err) return res.status(500).send({message:'Error en el tweet'})
                    })

                }

                if(err) return res.status(500).send({message:'Error en el tweet o no existe'})
                if(!userFollowing) return res.status(404).send({message:'Para poder darle like al tweet primero debe de seguir al dueño del mismo'})
            })
        }
        if(err) return res.status(500).send({message:'Error en el tweet'})

    })  
}



function disLike(req,res,idTweet) {
    var idUser = req.user.sub
    var tweetUser ;
    var dueno;

    User.findOne({'tweets._id':idTweet},(err,user)=>{
        if (user) {
            tweetUser  = user.usuario;
            dueno = user._id
            User.findOne({'following.user':tweetUser},(err,userFollowing)=>{
                if(userFollowing){
                    User.aggregate([
                        {$match : {'_id':dueno}},
                        {$project: {
                            tweets : {$filter: {
                                input: '$tweets',
                                as: 'tweet',
                                cond: {$and: [
                                    {$eq : ['$$tweet._id', ObjectId(idTweet)]},
                                    {$in: [idUser, '$$tweet.likes']}
                                ]}
                            }}
                        }}
                    ],(err,users)=>{
                        //console.log(JSON.stringify(users))
                        if(users && users.length && users[0].tweets && users[0].tweets.length){
                            User.findOneAndUpdate({'tweets._id':idTweet},{$pull:{'tweets.$.likes':idUser}},{new:true},(err,like)=>{
                                if(err) return res.status(500).send({message:'Error en el tweet o id equivocado'})
                                if(!like) return res.status(404).send({message:'Error al agregar el tweet'})
                                return res.status(200).send({tweets:like.tweets})
                            })
                        }else {
                            res.status(404).send({message:'No posee like en el tweet deseado'})
                        }

                        if(err) return res.status(500).send({message:'Error en el tweet'})
                    })

                }

                if(err) return res.status(500).send({message:'Error en el tweet o no existe'})
                if(!userFollowing) return res.status(404).send({message:'Para poder darle like al tweet primero debe de seguir al dueño del mismo'})
            })
        }
        if(err) return res.status(500).send({message:'Error en el tweet'})

    })  
}



function response(req,res,idTweet,mensaje) {
    var idUser = req.user.sub
    var tweetUser ;

    User.findOne({'tweets._id':idTweet},(err,user)=>{
        if (user) {
            tweetUser  = user.usuario;
            console.log(tweetUser)
            User.findOne({'following.user':tweetUser},(err,userFollowing)=>{
                if(userFollowing){
                    User.findOneAndUpdate({'tweets._id':idTweet},{$push:{'tweets.$.response':{user:idUser,descripcion:mensaje}}},{new:true},(err,like)=>{
                        if(err) return res.status(500).send({message:'Error en el tweet o id equivocado'})
                        if(!like) return res.status(404).send({message:'Error al agregar la respuesta del tweet'})
                        return res.status(200).send({tweet:like.tweets})
                    })
                }
                if(err) return res.status(500).send({message:'Error en el tweet o no existe'})
                if(!userFollowing) return res.status(404).send({message:'Para poder responder al tweet primero debe de seguir al dueño del mismo'})
            })
        }
        if(err) return res.status(500).send({message:'Error en el tweet'})

    })  
}



function reTweet(req,res,idTweet,mensaje) {
    var idUser = req.user.sub
    var tweetUser ;
    var dueno;

    User.findOne({'tweets._id':idTweet},(err,user)=>{
        if (user) {
            tweetUser  = user.usuario;
            dueno = user._id
            User.findOne({'following.user':tweetUser},(err,userFollowing)=>{
                if(userFollowing){
                    User.aggregate([
                        {$match : {'_id':dueno}},
                        {$project: {
                            tweets : {$filter: {
                                input: '$tweets',
                                as: 'tweet',
                                cond: {$and: [
                                    {$eq : ['$$tweet._id', ObjectId(idTweet)]},
                                    {$in: [idUser, '$$tweet.reTweets']}
                                ]}
                            }}
                        }}
                    ],(err,users)=>{
                        //console.log(JSON.stringify(users))
                        if(users && users.length && users[0].tweets && users[0].tweets.length){
                            User.findOneAndUpdate({'tweets._id':idTweet},{$pull:{'tweets.$.reTweets':idUser}},{new:true},(err,reTweet)=>{
                                if(err) return res.status(500).send({message:'Error en el tweet o id equivocado'})
                                if(!reTweet) return res.status(404).send({message:'Error al agregar el reTweet'})
                                if(reTweet){
                                    User.findByIdAndUpdate(idUser,{$pull:{reTweets:{tweet:idTweet}}},{new:true},(err,tweet)=>{
                                        if(err) res.status(404).send({message:'Error al reTweetear el tweet'})
                                    })
                                    return res.status(200).send({
                                        message:'Se ha eliminado su reTweet',
                                        tweet:reTweet.tweets
                                    })
                                }
                            })
                        }else {
                            //console.log('gg')
                            User.findOneAndUpdate({'tweets._id':idTweet},{$push:{'tweets.$.reTweets':idUser}},{new:true},(err,reTweet)=>{
                                if(err) return res.status(500).send({message:'Error en el tweet o id equivocado'})
                                if(!reTweet) return res.status(404).send({message:'Error al agregar el reTweet'})
                                if(reTweet){
                                    if (mensaje == null) {
                                        User.findByIdAndUpdate(idUser,{$push:{reTweets:{tweet:idTweet}}},{new:true},(err,tweet)=>{
                                            if(err) res.status(404).send({message:'Error al reTweetear el tweet'})
                                        })
                                    } else {
                                        User.findByIdAndUpdate(idUser,{$push:{reTweets:{tweet:idTweet,comentario:mensaje}}},{new:true},(err,tweet)=>{
                                            if(err) res.status(404).send({message:'Error al reTweetear el tweet'})
                                        })
                                    }
                                    return res.status(200).send({message:reTweet.tweets})
                                }
                            })
                        }

                        if(err) return res.status(500).send({message:'Error en el tweet'})
                    })

                }

                if(err) return res.status(500).send({message:'Error en el tweet o no existe'})
                if(!userFollowing) return res.status(404).send({message:'Para poder dar reTweet al tweet primero debe de seguir al dueño del mismo'})
            })
        }
        if(err) return res.status(500).send({message:'Error en el tweet'})

    })  
}

function viewTweets(user,req,res) {
    User.findOne({'following.user':user},(err,data)=>{
        if(err) res.status(500).send({message:'Error en el los tweets que desea ver'})
        if(!data){
            if(user === req.user.usuario){
                User.aggregate([
                    {$match:{usuario:user}},
                    {$unwind : "$tweets"},
                    {$project:{
                        _id: 0,
                        tweet: "$tweets.tweet",
                        likes: {$size: "$tweets.likes"},
                        reTweets: {$size:"$tweets.reTweets"},
                        response: {$size :"$tweets.response"}
                    }}
                    ],(err,tweets)=>{
                        if(err) return res.status(500).send({message:'Error en el perfil'})
                        if(!tweets) return res.status(404).send({message:'Error al ver los tweets'})
                        if(tweets) return res.status(200).send({tweets})
                    }
                )
            }else{
                return res.status(200).send({message:'No puede ver Tweets de personas que no sigue o no existe el usuario'})
            }
        }else if(data){
            User.aggregate([
                {$match:{usuario:user}},
                {$unwind : "$tweets"},
                {$project:{
                    _id: 0,
                    tweet: "$tweets.tweet",
                    likes: {$size: "$tweets.likes"},
                    reTweets: {$size:"$tweets.reTweets"},
                    response: {$size :"$tweets.response"}
                }}
                ],(err,tweets)=>{
                    if(err) return res.status(500).send({message:'Error en el perfil'})
                    if(!tweets) return res.status(404).send({message:'Error al ver los tweets'})
                    if(tweets) return res.status(200).send({tweets})
                }
            )
        }
    })
}



module.exports = {
    addTweet,
    deleteTweet,
    editeTweet,
    like,
    disLike,
    response,
    reTweet,
    viewTweets
}