const router = require("express").Router()
const mongoose = require("mongoose")
require("../models/User")
const User = mongoose.model("usuarios")

const bcrypt = require("bcryptjs")
const passport = require("passport")

const nodemailer = require("nodemailer")

const { makekey } = require("../helpers/support")
const { eUser } = require("../helpers/support")

// criando um objeto com as configurações do serviço de envio de mensagens. Será usado na recuperação de senha.
const trasferred = nodemailer.createTransport({
    //todos os dados abaixos são encontrados na documentação SMTP de cada provedor de serviço de e-mail
    host: 'smtp.gmail.com', 
    port: 465,
    secure: true,// será "true", até então, apenas para a porta 465, para qualquer outras: será "false"
    auth:
    {
        user: process.env.EAMIL_DISPARO,//aqui vai o endereço real do email que disparará o envio da mensagem
        pass: process.env.PASS_EMAIL//caso esteja usando servidor gmail então não usará a própriaa senha que se usa para acessar o email, mas sim uma que é gerada pelo próprio gmail. Bastta ir em configurações do gmail  e ir em senhas app: configurações => senhas app
    }
})

/* GET create new user*/
    router.get("/newUser", (req, res) => 
    {
        res.render("user/register");
    });

/* POST process creating user */
    router.post("/registro", (req, res) => 
    {
        const erros= [];
        
        //regex de caracteres que a senha precisará conter
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])(?:([0-9a-zA-Z$*&@#])){8,}$/;

        if( !req.body.nome || typeof req.body.nome === undefined || req.body.nome == null)
        {
            erros.push({text: "É necessário informar o nome do usuário"});
        }

        if( !req.body.email || typeof req.body.email === undefined || req.body.email == null)
        {   
            erros.push({text: "Endereço de e-mail inválido"});
        }

        if( !req.body.password || typeof req.body.password === undefined || req.body.password == null || !regex.test(req.body.password) )
        {
            erros.push({text: "Senha informada é inválida. A senha deve ter no mínimo 8 caracteres e conter letras minúscula, maiúscula, número e caracter especial (@#$%&)."});
        }

        if( req.body.password != req.body.confirmPassword)
        {
            erros.push({text: "As senhas informadas são diferentes."});
        }

        if(erros.length > 0)
        {
            res.render("user/register", {erros: erros});
        }
        else
        {   
            User.findOne({email: req.body.email}).lean()
            .then((usuario) => 
            {
                if(usuario)
                {
                    req.flash("error_msg", "O e-mail já está sendo usado por outra conta.")
                    res.redirect("/user/newUser")
                }
                else
                {
                    const sendToken = (token) =>
                    {
                        const newUser = new User({
                            name: req.body.nome,
                            email: req.body.email,
                            password: req.body.password,
                            token: token,
                            admin: 0
                        });

                        if(req.body.check) newUser.admin = 1;

                        bcrypt.genSalt(10, (err, salt) =>
                        {
                            bcrypt.hash(newUser.password, salt, (err, hash) =>
                            {
                                if(err)
                                {
                                    req.flash("error_msg", "Ocorreu um erro no processo de gerar novo usuário")
                                    console.log(`Cod: Newuser0001. ${err}`)
                                    res.redirect("/user/registro")
                                }
                                else
                                {
                                    newUser.password = hash;
                                    newUser.save()
                                    .then(() => 
                                    {
                                        trasferred.sendMail({
                                            from: "Blog Wolde TI <thiagoncp@gmail.com>",
                                            to: req.body.email,
                                            subject: "Confirmação de conta criada", //assunto do e-mail
                                            html: 
                                            `<h1>Nova conta de usuário</h1> 
                                            <p>
                                                Olá, ${req.body.nome}, a sua conta no <strong>Blog Wolde TI</strong> foi criada com sucesso.
                                            </p>
                                            <p>
                                                Por gentileza, confirme que foi você mesmo quem criou a conta. Para isso basta clicar nesse  botão: 
                                               <a href="http://localhost:3030/user/login/${token}"><button type="button" style=" cursor: pointer; background-color: #248; border-radius: 5px; border: none; padding: 4px; width: fit-content;" title="link de comfirmação"> Corfirmar </button></a> 
                                            </p>
                                            <p>Se preferir pode acessar esse <a title="http://localhost:3030/user/login/${token}" href="http://localhost:3030/user/login/${token}">link</a> e será redirecionado para a página de login.</p>
                                            <h4><strong> Caso não tenha sido você quem gerou a criação de conta. Por gentileza, desconsidere a mensagem.</strong></h4>
                                            <h4>A equipe do Blog Wolde TI agradece atenção!</h4>
                                            `, //corpo do e-mail em html
                                            
                                            text: `Olá, ${req.body.nome}, a sua conta no Blog Wolde TI foi criada com sucesso. Por gentileza, confirme que foi você mesmo quem criou a conta. Para isso basta clicar no botão ou link que está no corpo do e-mail.\n A equipe do Blog Wolde TI agradece atenção!`//aqui é uma segunda opção de envio da mensagem do e-mail, caso o servidor de e-mail usado não tenha suporte html para o corpo
                                        })  

                                        req.flash("success_msg", `Olá, ${req.body.nome}. A sua conta foi gerada com sucesso. Por gentileza, acesse o seu e-mail e confirme a criação da conta para o seu acesso ser liberado.`)
                                        res.redirect("/user/newUser")
                                    })
                                    .catch((err) => 
                                    {
                                        req.flash("error_msg", "Ocorreu um erro mna tentativa de criação da conta. Por gentileza, tente novamente")
                                        console.log(`Cod NewUser0002: ${err}`)
                                        res.redirect("/user/registro")
                                    })
                                }
                            });
                        });         
                    } 
                    makekey(sendToken, 14, {key: "token"})                  
                }
            })
            .catch( (err) =>    
            { 
                req.flash("error_msg", "Houve um erro inesperado ao tentar se cadastrar")
                console.log(`Cod NewUser0003: ${err}`)
                res.redirect("/user/registro")
            })
        }
    });


/* GET page confirmation register*/
    router.get("/login/:token", (req, res) =>
    {
        User.findOne({token: req.params.token})
        .then( (usuario) => 
        {
            usuario.validated = 1;
            usuario.save();            
            User.updateOne({_id: usuario._id},{$unset:{token: req.params.token}})
            .then(()=>
            {
                req.flash("success_msg", "Usuário validado com sucesso!")
                res.redirect("/user/login")
            })
            .catch( (err) =>
            {
                req.flash("error_msg","Um erro inesperado ao tentar validar o usuário ocorreu")
                console.log(`Cod token0001: ${err}`)
            })
        })
        .catch( (err) => 
        {
            req.flash("error_msg", "A tentativa de ativação da conta falho, ou pelo token ter expirado ou pelo token ser inválido.")
            console.log(`Cod token0002: ${err}`)
            res.redirect("/")
        })
    })

/* GET page regain access */ 
    router.get("/regain_access", (req, res) => 
    {
        res.render("user/regainAccess");
    })

/* POST regain Access */
    router.post("/regain_access", (req, res) =>
    {
        const erro = [];

        if( !req.body.email || typeof req.body.email === undefined || req.body.email == null)
        {   
            erro.push({text: "Informe um endereço de e-mail válido"});
        }

        if(erro.length > 0)
        {
            res.render("user/regainAccess", {erro: erro})
        }
        else
        {
            User.findOne({email: req.body.email}).lean()
            .then( (usuario) => 
            {
                if(!usuario)
                {
                    req.flash("error_msg", "Conta não encontrada na base de dados.")
                    res.redirect("/user/regain_access")
                }
                else
                {
                    const sendPass = (newKey) =>
                    {
                        User.findOne({_id: usuario._id})
                        .then ((user) => 
                        {
                            bcrypt.genSalt(10, (err, salt) =>
                            {
                                bcrypt.hash(newKey, salt, (err, hash) =>
                                {
                                    if(err)
                                    {
                                        req.flash("error_msg", "Ocorreu um erro no processo de geração da nova senha");
                                        console.log(`Cod Semail0001 ${err}`);
                                        res.redirect("/user/regain_access");
                                    }
                                    else
                                    {
                                        user.password = hash;
                                        user.save()
                                    }
                                });
                            });

                            trasferred.sendMail({
                                from: "Blog  <thiagoncp@gmail.com>",
                                to: req.body.email,
                                subject: "Recuperação de dados de acesso", //assunto do e-mail
                                html: `<h1>Recuperação dados de Acesso</h1> <p> Olá, ${user.name}, a sua nova senha de acesso ao <strong>Blog</strong> é: ${newKey}<br><h1>`, //corpo do e-mail em html
                                text: `Recuperação dados de Acesso. Olá, ${user.name}, a sua nova senha é: ${newKey}`//aqui é uma segunda opção de envio da mensagem do e-mail, caso o servidor de e-mail usado não tenha suporte html para o corpo
                            })
                                req.flash("success_msg", "Opa! Foi gerado um novo password e encaminhado para o seu e-mail")
                                res.redirect("/user/regain_access")

                        })
                        .catch((err) =>
                        {
                            req.flash("error_msg", "Ocorreu um erro inesperado que impossibilitou a recuperação de acesso. Tente novamente")
                            console.log(`Cod Semail0003: ${err}`)
                            res.redirect("/user/regain_access")
                        })
                    }
                    makekey(sendPass, 8, {key: "password"})
                }
            })
            .catch( (err) => 
            {
                req.flash("error_msg", "Não foi possível finalizar o processo de recuperação de acesso.\nOcorreu um erro inesperado.")
                console.log(`Cod Semail0004: ${err}`)
                res.redirect("/user/regain_access")
            })
        }

    })

/* GET alter password*/
    router.get("/alter_password", eUser, (req, res) => 
    {
        res.render("user/alterPassword")
    })

/* POST alter password*/
    router.post("/alter_password", eUser, (req, res) => 
    {

        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])(?:([0-9a-zA-Z$*&@#])){8,}$/;
        const erros = [];

        if( !req.body.current_password || req.body.current_password === undefined || req.body.current_password == null )
        {
            erros.push({text: "Password informado é inválido. Tente novamente."})
        }

        if( !req.body.new_password || req.body.new_password === undefined || req.body.new_password == null || !regex.test(req.body.new_password) )
        {
            erros.push({text: "Senha informada é inválida. A senha deve ter no mínimo 8 caracteres e conter letras minúscula, maiúscula, número e caracter especial (@#$%&)."});
        }

        if( req.body.new_password !== req.body.confirm_password)
        {
            erros.push({text: "As senhas informadas não coincidem. Tente novamente"});
        }
        
        if(erros.length > 0 ) res.render("user/alterPassword" , {erros: erros})
        
        else
        {
            User.findOne({_id: req.user._id})
           .then((usuario) => 
            {
                bcrypt.genSalt(10, (err, salt) =>
                {
                    bcrypt.hash(req.body.new_password, salt, (err, hash) =>
                    {
                        if(err)
                        {
                            req.flash("error_msg", "Ocorreu um erro no processo de geração da nova senha");
                            console.log(`Cod: Pass0001. ${err}`);
                            res.redirect("/user/regain_access");
                        }
                        else
                        {
                            bcrypt.compare(req.body.current_password, usuario.password, (err, ok) =>
                            {
                                if(ok) 
                                {  
                                    usuario.password = hash;
                                    usuario.save()
                                    .then( () => 
                                    {
                                        req.flash("success_msg", "A senha foi alterada com sucesso.")
                                        res.redirect("/user/alter_password")
                                    })
                                    .catch( () => 
                                    {
                                        req.flash("error_msg", "Ocorreu um erro inesperado que impediu a conclusão da alteração da senha.")
                                        console.log(`Cod Pass0002: ${err}`)
                                        res.redirect("/user/alter_password")
                                    })
                                }
                                else    
                                {
                                    req.flash("error_msg", "A senha informada como atual não coincide com a gravada na base de dados.")
                                    res.redirect("/user/alter_password/?fail=true")
                                }
                            })
                        }
                    });
                })

            })
            .catch( (err) =>
            {
                req.flash("error_msg", "Ocorreu um erro inesperado que impediu a conclusão da alteração da senha.")
                console.log(`Cod Pass0003: ${err}`)
                res.redirect("/user/alter_password")
            })
        }
        
        
    })

/* GET login Page */
    router.get("/login", (req, res) =>
    {
        if(req.cookies)
        {
            res.render("user/login", {teste: req.cookies}) 
        }
        else
        {
            res.render("user/login")
        }
    })

/* POST login page */
    router.post("/login", (req, res, next) =>
    {

        if(req.body.check)
        {
           res.cookie('myEmail', req.body.email, path='/')
           res.cookie('myPassword', req.body.password, {maxAge: 60000, path:"/"})
        }

        passport.authenticate('local', {
            successRedirect: "/",
            failureRedirect: "/user/login",
            failureFlash: true
        })(req, res, next)
    })

/* GET lgout user */
    router.get("/logout", (req, res, next) =>
    {
        req.logOut((err)=>
        {
            if(err) return next(err) 
            res.clearCookie('myEmail')
            res.clearCookie('myPassword')
            res.redirect("/")
        })
    })

module.exports =  router
