const router = require("express").Router()

const mongoose = require("mongoose")
require("../models/Category")
const Category = mongoose.model("categorias")   
require("../models/Post")
const Post = mongoose.model("postagens")

/* GET category filter */
    router.get("/categorias", (req, res) => 
    {
        Category.find().lean()
        .then( (categorys) => 
        {
            res.render("categorys/index", {category: categorys});
        })
        .catch( (err) => 
        {
            req.flash("error_msg", "Ocorreu um erro inesperado que impossibilitou o carregamento da página");
            console.log(`Cod app0004: ${err}`);
            res.redirect("/");
        })
    })
    
/* GET all posts in a category */
    router.get("/filter_post_category/:name/:id", (req, res) =>
    {
        Post.find({category:(req.params.id)}).populate("category").lean()
        .then( (posts) => 
        {   
            if(posts)
            {   
                Category.findOne({_id:(req.params.id)}).lean()
                .then((category) => { res.render("posts/posts", {post: posts, catSelect: category}) })
                .catch((err) => 
                { 
                    req.flash("error_msg", "Ocorreu uma falha inespreda ao tentar carregar os posts.");
                    console.log(`Cod app0005: ${err}`);
                    res.redirect("/category/categorias");
                })
            }
            else
            {
                req.flash("error_msg", `Não foi encontrado posts da categoria "${req.params.name}"`);
                res.redirect("/category/categorias");
            }
        })
        .catch((err) => 
        {
            req.flash("error_msg", "Ocorreu um erro inesperado que impossibilitou o carregamento da página");
            console.log(`Cod app0006: ${err}`);
            res.redirect("/category/categorias/?fail=true");
        })
    })

module.exports = router