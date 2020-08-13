'use strict'

var express = require("express")
var commandController = require("../controllers/commandsController")
var md_auth = require("../middlewares/authenticated")



//Rutas

var api = express.Router()

api.post('/commands',md_auth.ensureAuth,commandController.commands)


module.exports = api;