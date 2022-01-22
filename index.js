const express = require('express');
const app = express();
const badyParser = require('body-parser');
const connection = require('./database/database');
const Pergunta = require('./database/Pergunta')
const Resposta = require('./database/Resposta')
//Database
connection
.authenticate()
.then(() => {
    console.log('Conexão realizada com sucesso')
})
.catch((msgError) => {
    console.log(msgError);
})


// Estou falando para o Express usar o EJS como view engine
app.set('view engine', 'ejs');

// definição dos arquivos estaticos
app.use(express.static('public'))

// tem que colocar o bady-parser dessa forma para que ele converta os formularios em javaScript
app.use(badyParser.urlencoded( {extended: false}))
app.use(badyParser.json())

//Rotas
// mandando o express renderizar o arquivo 'index' que está na pasta views <==
app.get('/', (req, res) => {
    Pergunta.findAll({raw: true, order:[
        ['id', 'DESC'] // ACS = CRESCENTE DESC = decrecente
    ]}).then(perguntas => {
        res.render('index',{
perguntas: perguntas
        });
    })
});

app.get('/perguntar', (req, res) => {
    res.render('perguntar');
})

app.post('/salvarpergunta', (req, res) => {
    var titulo = req.body.titulo;
    console.log(req.body)
    var descricao = req.body.descricao;
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(()=>{
        res.redirect('/');
    })
})

app.get('/pergunta/:id', (req, res) => {
    var id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        if(pergunta != undefined) {
            Resposta.findAll({
                where: {perguntaId: pergunta.id},
              //  order: [  ['id', DESC]   ] está bugado esssa ordenação de respostas
            }).then(respostas => {
                res.render('pergunta', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            });            
   } else {
            res.redirect('/')
        }
    })
})

app.post('/responder',(req, res) => {
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
        res.redirect('/pergunta/' +perguntaId)
    })
})
app.listen(8080,() => {console.log('Servidor Rodando')})