const express = require("express");
const app = express();

const bodyParser = require('body-parser')
const session = require("express-session")

const connection = require('./database/database')

const categoriesController = require('./categories/CategoriesController')
const articlesController = require('./articles/ArticlesController')
const usersController = require("./users/UsersController");

const Article = require("./articles/Article")
const Category = require("./categories/Category")
const User = require("./users/User")
//view engine
app.set('view engine',  'ejs')

//sessions 1s = 1000 ms
app.use(session({
    secret: "qualquercoisa",
    cookie: {
        maxAge: 3000000
    }
}))

//Redis


app.use(express.static('public'));
//body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//DataBase Connection

connection
        .authenticate()
        .then(() => {
            console.log("conectado com o Banco de dados")
        }) .catch((error) => {
            console.log(error);
        })

app.use("/",categoriesController)
app.use("/", articlesController)
app.use("/", usersController)

app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render('index', {
                articles: articles,
                categories: categories
            })
        })

    })
})

app.get("/:slug", (req, res) => {
    let slug = req.params.slug;
    Article.findOne({
        where: {
            slug:slug
        }
    }).then(article => {
        if(article !=undefined) {
            Category.findAll().then(categories => {
                res.render('index', {
                    categories: categories,
                    article: article
                })
            })
        } else{
            res.redirect("/")

        }
    }).catch(err =>{
        res.redirect("/")

    })
})

app.get("/category/:slug",(req, res) => {
    const slug = req.params.slug
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then( category => {
        if(category !=undefined) {
            Category.findAll().then(categories => {
                res.render("index", {
                    articles: category.articles,
                    categories: categories

                })
            })
        } else {
            res.redirect('/')
        }
    }).catch(err => {
        res.redirect('/')
    })
})

app.listen(8080, () => {
    console.log("servidor está rodando na porta 8080")
})