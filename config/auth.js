const localStartegy = require("passport-local").Strategy //informada a estratégia a ser usada: passport-local

const bcrypt = require("bcryptjs")

const mongoose = require("mongoose")
require("../models/User")
const User = mongoose.model("usuarios")

//user autentication 
module.exports = function (passport)
{
    // usernameField é a coluna da tabela/propiedade do documento que será usada para validar o passport(log)
    passport.use( new localStartegy({usernameField: 'email', passwordField: 'password'}, (email, password, done) => 
    {
        User.findOne({email: email})
        .then((usuario) => 
        {
            if(!usuario)
            {
                return done(null, false, {message: "Usuário não existe."})
            }
            else if(usuario.validated !== 1)
            {
                return done(null, false, {message: "Usuário sem premissão para acesso."})
            }
            else
            {
                bcrypt.compare(password, usuario.password, (err, ok) =>
                {
                    if(ok) 
                    {
                        return done(null, usuario)
                    }
                    else    
                    {
                        return done(null, false, {message: "Oops. Senha incorreta."})
                    }
                })
            }
        })
        .catch( (err) => { done(err, false) })
    }))

   
    passport.serializeUser( (usuario, done) => 
    {
        done(null, usuario.id)
    })

    passport.deserializeUser( (id, done) => 
    {
        User.findById(id)
        .then((usuario) =>
        {
            done(null, usuario)  
        })
        .catch((err) => done(err, null) )
    })
}