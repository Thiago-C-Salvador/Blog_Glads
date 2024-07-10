require("dotenv").config()
const express = require("express")
const handlebars = require("express-handlebars")

const mongoose = require("mongoose")
require("./models/Post")
const Post = mongoose.model("postagens")

const { format } = require("date-fns")
const { ptBR } = require("date-fns/locale/pt-BR")
const { eAdmin } = require("./helpers/support")

// const bodyParser = require("body-parser")

//routers
const admin = require("./routes/admin") 
const user = require("./routes/user")
const category = require("./routes/category")
const post = require("./routes/post")

const path = require("path") 
const flash = require("connect-flash") 
const session = require("express-session")

const passport = require("passport")
require("./config/auth")(passport)

const cookieParser = require("cookie-parser")

// const {nickName} = require("./helpers/pertinentes")
const app = express();
app.use(cookieParser());

//General settings
    //Session                                                          
        app.use( session({ secret: process.env.PASS_SECRET, resave: true, saveUninitialized: true, cookie: {maxAge: 1000 * 60 * 60} }));
        /*
            * propriedade "resave" define se session deve ser salva em todas requisições.
            * propriedade "saveUninitialized" define se até os usários anônimos tabmbém terão session salvas.
            * propriedade "cookie" define quanto tempo a session ficaram registrados. No caso da aplicação serão 30 minutos.
        */

        //tem de ser declarado abaixo da inicilização do session 
        app.use(passport.initialize())
        app.use(passport.session())

    //Flash => tem de ficar abaixo da chamada do "session"
        app.use(flash());

    //Midleware
        app.use( (req, res, next) =>
        {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error");//variável cofigurada para exibir mensagens do passport e 
            res.locals.user = req.user || null;
            res.locals.admin =  req.user ? (req.user.admin === 1 ? "Administrador" : null) : null
            next();
        });

    //Parser do dados da requisição
        // app.use(bodyParser.urlencoded({extended: true}))
        // app.use(bodyParser.json())
        app.use(express.urlencoded({extended: true})); 
        app.use(express.json());//atualmente o expresse já tem seu próprio método de parse de dados em formato JSON

    //handlebars (sistema de templates)
        app.engine("handlebars", handlebars.engine
        ({ 
            defaultLayout: 'main', 
            helpers://para costumizar dados exibidos pelo handlebars
            {
                //formatar data
                formatDate: (date) => 
                {
                    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss " , { locale: ptBR });
                },

                //listar todo campo select e definir como selecionado o mesmo do banco de dados
                idOptionsSelect: (v1, v2, options) => 
                {
                    v1 = v1._id.toString();
                    v2 = v2._id.toString();
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                },

                // nickName: (name) => ** Fiz pelo arquivo "pertinentes" na pasta "helpes" para fins de teste e didático **
                // {
                //     fullName = name.split(" ")
                //     return fullName = fullName[0] 
                // } 
            }
        }));
        app.set('view engine', 'handlebars'); 
        app.set("views", path.join(__dirname, "./views"));

    
    //Archevs public
    app.use("/static/public", express.static("public"));
    
    //Mongoose
        mongoose.connect(process.env.DB)
        .then(() => console.log('Mongodb startado com sucesso. Banco de dados "blog" pronto para ser usado'))
        .catch((err) => (`Ocorreu um erro inesperado ao tentar se conectar com o banco. Cod app0001: ${err}`))

// Settings of route
    
    /* GET page index*/
    app.get("/", (req, res) => 
    {
        Post.find().populate("category").limit(5).sort({date: "desc"}).lean()
        .then( (posts) => {  res.render("index", { post: posts }) })
        .catch( (err) => 
        { 
            req.flash("error_msg", "Ocorreu um erro interno");
            console.log(`Cod app0002: ${err}`) ;
            res.redirect("/404");
        })
    })

    

    //page in case index page not found
    app.get("/404", (req, res) => { res.send("Erro 404")});

    //access rute declared in ./routes
    app.use('/user', user);
    app.use('/post', post);
    app.use('/category', category);
    app.use('/admin', eAdmin, admin);

const PORT = process.env.PORT_SERVER
//Settings server webapp
app.listen(PORT, () => { console.log("Aplicação web startado na porta: " + PORT)});