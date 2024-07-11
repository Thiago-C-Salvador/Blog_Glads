const { create } = require("express-handlebars");
const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const User = new Schema
({
    name:
    {
        type: String,
        requered: true
    },
    
    email:
    {
        type: String,
        requered: true
    },

    admin:
    {
        type: Number,
        default: 0
    },

    password:
    {
        type: String,
        requered: true
    },

    token:
    {
        type: String,
        dafault: 0
    },

    validated:
    {
        type: Number,
        default: 0
    }
});



mongoose.model("usuarios", User)