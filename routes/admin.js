const router = require("express").Router()
const mongoose = require("mongoose")
require("../models/Category")
const Category = mongoose.model('categorias')
require("../models/Post")
const Post = mongoose.model("postagens")

router.get("/categorias", (req, res) => 
{
    Category.find().sort({date: 'desc'}).lean()
    .then((categorys) => { res.render("admin/categorys", {categorys: categorys}) })
    .catch((err) => { req.flash(`erro_msg", "Houve um erro ao carregar categorias. Cod lsCat0001: ${err}`), res.redirect("/admin/categorias") })
});
    
/* GET for add new post*/
router.get("/categorias/add", (req, res) =>
{
    res.render("admin/addcategorys");
})  

/* GET for create newc ategory */
router.post("/categorias/criacao", (req, res) =>
{
    const erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
    {
        erros.push({ text: "Informe um nome de categoria." });
    }
    else 
    if(req.body.nome.length < 2)
    {
        erros.push({ text: "Nome de categoria é muito pequeno." });
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
    {
        erros.push({ text: "Slug inválido." });
    }

    if(erros.length > 0)
    {
        res.render("admin/addcategorys", {erros: erros});
    }
    else
    {
        const dataCollection  =
        {
            name: req.body.nome,
            slug: req.body.slug,
            date: new Date()
        };
    
        new Category(dataCollection).save()
        .then( () => 
        {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        })
        .catch( (err) => 
        {
            req.flash("error_msg", "Houve um erro ao tentar gerar nova categoria. Tente novamente.");
            res.redirect("/admin/categorias/add");
            console.log(`Erro ao tentar cadastrar categoria. Cod AddCat0001: ${err}`);
        })
    }
});

/* GET edit category */ 
    router.get("/categorias/editar/:id", (req, res) =>
    {
        Category.findOne({ _id: req.params.id }).lean()
        .then((category) =>  { res.render("admin/editcategorys", {category: category}) })
        .catch((err) => { req.flash("error_msg", `Categoria Não encontrada. Cod EditCat0001: ${err}`) })
    });

/* POST edit category */
    router.post("/categoria/editada", (req, res) => 
    {
        const erros = [];

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
        {
            erros.push({text: "Informe um nome de categoria"});
        }
        else if(req.body.nome.length < 2)
        {
            erros.push({text: "Nome de categoria é muito pequeno"});
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
        {
            erros.push({text: "Slug inválido"});
        }

        if(erros.length > 0)
        {
            res.render("admin/editcategorys", {erros: erros});
        }
        else
        {   
            Category.findOne({ _id: req.body.id })
            .then( (categoria) => 
            {
                categoria.name = req.body.nome;
                categoria.slug = req.body.slug;
                categoria.save()
                .then(() => { req.flash("success_msg", "Categoria atualizada com sucesso!" ), res.redirect("/admin/categorias") })
                .catch((err) => 
                { 
                    req.flash("error_msg", "Ocorreu um erro interno  de conexão com o banco de dados durante a atualização dos dados da categoria ");
                    console.log(`Cod EditCat0002 ${err}`);
                })
            })
            .catch( (err) => 
            {
                req.flash("error_msg", "Ocorreu uma falha inesperada. Dados não atualizados. Tente novamente.");
                res.redirect("/admin/categorias");
                console.log(`Erro ao tentar atualizar o cadstro. Cod EditCat0003 ${err}`);
            })

        }
    });

/* POST delete category */
    router.post("/categoria/delete", (req, res) =>
    {
        Post.findOne({category: req.body.id })
        .then((post) =>
        {
            console.log(post)
            if(post !== null)
            {
                req.flash("error_msg", "Não é possível excluir a categoria, pois existe post pertencente à categoria")
                res.redirect("/admin/categorias")
            }
            else
            {
                Category.deleteOne({ _id: req.body.id })
                .then(() => { req.flash("success_msg", `Categoria ${req.body.name} deletada com sucesso!`), res.redirect("/admin/categorias") })
                .catch((err) => { req.flash("error_msg", "Ocorreu um erro inesperado ao tentar excluir a categorio."), console.log(`Cod delCat0001 ${err}`), res.redirect("/admin/categorias") })
            }
        })
        .catch((err) =>
        {

        })
    });

/* GET page posts */
    router.get("/postagens", (req, res) =>
    {
        Post.find().populate("category").sort({date: 'desc'}).lean()
        .then( (posts) => { res.render("admin/posts", { post: posts })})
        .catch( (err) => { req.flash("error_msg", `Ocorreu um erro inesperado que impossibilitou carregar os posts. Cod showPost0001 ${err}`), res.redirect("admin/posts") })
    });
/* GET form add new post */
    router.get("/postagens/add", (req, res) =>
    {
        Category.find().lean()
        .then((categorys) => { res.render("admin/addposts", {categorys: categorys}) })
        .catch((err) => { req.flash(`error_msg", "Ocorreu um erro ao carregar o formulário. Cod formAdd0001 ${err}`), res.redirect("/admin/agua") })
    });

/* POST create new post */ 
    router.post("/postagens/criacao", (req, res) => 
    {    
        const erros = [];

        //campo titulo
            if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null)
            {
                erros.push({ text: "Informe um titulo para a postagem a ser gerada" });
            }
            else if(req.body.titulo.length < 3)
            {
                erros.push({ text: "Nome para titulo é muito pequeno. Crie um titulo com ao menos 3 letras" });
            }

        //campo slug
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
            {
                erros.push({ text: "Slug inválido" });
            }
        
        //campo descrição
            if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null)
            {
                erros.push({ text: "Informe uma descricao para a postagem a ser gerada" });
            }
            else if(req.body.descricao.length < 4)
            {
                erros.push({ text: "Descricao para o post é muito pequena - deve coner ao menos 10 caracteres." });
            } 
        
        //area de texto
            if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null)
            {
                erros.push({ text: "Crie um conteúdo para a postagem." });
            }
            else
            {
                if(req.body.conteudo.length < 4)
                {
                    erros.push({ text: "Conteúdo deve conter um texto de no mínimo 10 caracteres." });
                }
            }
        
        //select categorias
            if(req.body.categoria == "0")
            {
                erros.push({ text:"Selecione uma categoria válida para o post." });
            }

        if(erros.length > 0)
        {
            res.render("admin/addposts", {erros: erros});
        }
        else
        {
            // const moment = date.format(new Date(), "dd/MM/yyyy à\'s\' HH:MM:ss")

            const datasCollection =
            {
                title: req.body.titulo,
                slug: req.body.slug,
                description: req.body.descricao,
                content: req.body.conteudo,
                category: req.body.categoria,
                date: new Date()
            };

            new Category(datasCollection).save()
            .then( () => 
            {
                req.flash("success_msg", "Post criado com sucesso!");
                res.redirect("/admin/postagens");
            })
            .catch( (err) => 
            {
                req.flash("error_msg", "Houve um erro ao tentar gerar novo post. Tente novamente.");
                res.redirect("/admin/postagens/add");
                console.log(`Erro ao tentar cadastrar post. Cod newPost0001 ${err}`);
            })
        }
    });

/* GET form edit post */ 
    router.get("/posts/editar/:id", (req, res) => 
    {
        Post.findOne({_id: req.params.id}).populate("category").lean()
        .then((post) => 
        { 
            Category.find().lean()
            .then((categorys) => 
            {
                res.render("admin/editpost", { categorys: categorys, post: post });
            })
            .catch((err) => { req.flash("error_msg", "Falha ao listar categorias"), console.log( `Cod formEditPost0001 ${err}`), res.redirect("/admin/postagens") })   
        })
        .catch((err) => 
        { 
            req.flash("error_msg", "Ocorreu uma falha inesperada que impossibilitou carregar os dados do post.");
            console.log(`Erro ocorrido ao tentar carrega o formulário de edição. Cod formEditPost0002 ${err}`);
        })
    });

/* POST edit post */
    router.post("/post/editado", (req, res) => 
    {
        const erros = [];

        //campo titulo
            if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null)
            {
                erros.push({ text: "Informe um titulo para a postagem a ser gerada" });
            }
            else if(req.body.titulo.length < 3)
            {
                erros.push({ text: "Nome para titulo é muito pequeno. Crie um titulo com ao menos 3 letras" });
            }

        //campo slug
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
            {
                erros.push({ text: "Slug inválido" });
            }
        
        //campo descrição
            if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null)
            {
                erros.push({ text: "Informe uma descricao para a postagem a ser gerada" });
            }
            else if(req.body.descricao.length < 4)
            {
                erros.push({ text: "Descricao para o post é muito pequena - deve coner ao menos 10 caracteres." });
            } 
        
        //area de texto
            if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null)
            {
                erros.push({ text: "Crie um conteúdo para a postagem." });
            }
            else
            {
                if(req.body.conteudo.length < 4)
                {
                    erros.push({ text: "Conteúdo deve conter um texto de no mínimo 10 caracteres." });
                }
            }
        
        //select categorias
            if(req.body.categoria == "0")
            {
                erros.push({ text:"Selecione uma categoria válida para o post." });
            }

        if(erros.length > 0)
        {
            res.render("admin/editpost", {erros: erros});
        }
        else
        {
            Post.findById({_id: req.body.id})
            .then((post) => 
            {
                post.title = req.body.titulo,
                post.slug = req.body.slug,
                post.description = req.body.descricao,
                post.content = req.body.conteudo,
                post.category = req.body.categoria,
                post.save();

                req.flash("success_msg", "Post atualizado com sucesso!");  
                res.redirect("/admin/postagens");
            })
            .catch( (err) => 
            {
                req.flash("error_msg", "Houve um erro ao tentar atualizar o post. Tente novamente.");
                res.redirect("/admin/postagens/add");
                console.log(`Erro ao tentar atualizar post. Cod editPost0001 ${err}`);
            })
        }
    });

/* router delete post */
    router.post("/post/delete", (req, res) => 
    {
        Post.deleteOne({_id: req.body.id})
        .then( () => { req.flash("success_msg", "Post foi deletado com sucesso!"), res.redirect("/admin/postagens")})
        .catch( () =>
        {
            req.flash("error_msg", "O correu um erro que impossibilitou excluir o post. tente novamente");
            console.log(`Cod delPost0001 ${err}`);
            res.redirect("/admin/postagens");
        })
    });

module.exports = router 