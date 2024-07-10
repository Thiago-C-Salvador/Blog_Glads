const router = require("express").Router()

const mongoose = require("mongoose")
require("../models/Post")
const Post = mongoose.model("postagens")

     /* GET page of access to all published posts*/
     router.get("/postagens", (req, res) =>
        {
            Post.find().populate("category").sort({date: "desc"}).lean()
            .then( (posts) => {  res.render("posts/allposts", { post: posts }) })
            .catch( (err) => 
            { 
                req.flash("error_msg", "Ocorreu um erro interno");
                console.log(`Cod app0002: ${err}`) ;
                res.redirect("/404");
            })
        }) 
    
        /* GET page of access to published posts by slug*/
        router.get("/postagem/:slug", (req, res) =>
        {
            Post.findOne({slug: req.params.slug}).populate("category").lean()
            .then((post) => 
            {
                if(post)
                {   
                    res.render("posts/postselected", {post: post});
                }
                else
                {
                    req.flash("error_msg", '"Ops! Post não encontrado."');
                    res.redirect("/");
                }
                
            })
            .catch((err) => 
            { 
                req.flash("error_msg", "Ocorreu um erro que impossibilitou carregar o post.");
                console.log(`Cod app0003: ${err}`);
                res.redirect("/");
            })
        })

module.exports = router