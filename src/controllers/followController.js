'use strict'

var User = require('../models/user')



function follow(userFollow,req,res) {

    var idUser = req.user.sub
    
    User.findById(idUser,(err,usuario)=>{
        if(err) res.status(500).send({message:'Error en el usuario'})
        if(!usuario) res.status(404).send({message:'Error en el usuario o no esta logeado actuamente'})
        if(usuario){
            User.findOne({usuario:{$in:userFollow}},(err,dato)=>{
                if(err) return res.status(404).send({message:'Error al seguir al usuario'})
                if(!dato){
                    res.status(404).send({message:'El usuario al que desea seguir no existe'})
                }else if(dato.usuario === req.user.usuario){
                    res.status(404).send({message:'No puede seguirse a si mismo'})
                }else if(dato.usuario != req.user.usuario){
                    User.findById(idUser,{following:{$elemMatch:{user:userFollow}}},(err,test)=>{
                        if(err) return res.status(404).send({message:'Error al seguir al usuario'})
                        //console.log(test)
                        if(test.following.length === 0){
                            User.findByIdAndUpdate(idUser,{$push:{following:{user:userFollow}}},{new:true},(err,profile)=>{
                                if(err) res.status({message:'Error al seguri el usuario'})
                                if(profile){
                                    User.findOneAndUpdate({'usuario':userFollow},{$push:{followers:{user:req.user.usuario}}},(err,followers)=>{
                                        console.log(followers)
                                        console.log(err)
                                    })

                                    return res.status(200).send({profile})
                                }
                            })
                        }else{
                            res.status(404).send({message:'Ya sigue a este usuario'})
                        }
                    })
                }                
            })
        }
    })

}


function unfollow(userFollow,req,res) {
    var idUser = req.user.sub

    User.findOne({'_id':idUser},{following:{$elemMatch:{user:userFollow}}},(err,data)=>{
        if(err) res.status(404).send({message:'Error en el usuario'})
        //console.log(data)
        if(data.following.length === 0){
            res.status(404).send({message:'Error al dejar de seguir al usuario'})
        }else if(data.following != 0){
            User.findOneAndUpdate({'_id':idUser},{'$pull':{following:{user:userFollow}}},{new:true} ,(err,profileUnFollow)=>{
                if(err) res.status(404).send({message:'Error al elimnar el usuario'})
                if(profileUnFollow){
                    User.findOneAndUpdate({'usuario':userFollow},{'$pull':{followers:{user:req.user.usuario}}},(err,unfollow)=>{
                        console.log(err)
                        console.log(unfollow)
                    })

                    return res.status(200).send({profileUnFollow})
                }
            })
        }
    })
}

module.exports = {
    follow,
    unfollow
}