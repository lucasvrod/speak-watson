const express = require('express')
const app = express()
const port = 8080

const bodyParser = require('body-parser')
const connection = require('./database/database')
const Comentario = require('./database/Comentario')

//MYSQL CONNECTION
connection
    .authenticate()
    .then(() => {
        console.log("--> Banco conectado com sucesso");
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//LIST ALL COMMENTS
app.get('/', (req, res) => {
    Comentario.findAll({
        raw: true,
        order: [['id', 'ASC']]
    }).then((comentario => {
        res.render('index', {
            comentarios: comentario
        });
    }))
})

//SAVE COMMENTS
app.post('/salvarcomentario', (req, res) => {    
    var descricao = req.body.descricao
    Comentario.create({
        descricao: descricao
    }).then(() => {
       res.redirect('/'); 
    })
})

//CONVERT COMMENT IN AUDIO AND GENERATE .WAV FILE
app.get('/ouvircomentario/:id', (req, res) => {
    var idcomentario = req.params.id;

    Comentario.findOne({
        where: { id: idcomentario }
    }).then(comentario => {

        const texto = comentario.descricao
        const fs = require('fs');
        const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
        const { IamAuthenticator } = require('ibm-watson/auth');
        const textToSpeech = new TextToSpeechV1({
            authenticator: new IamAuthenticator({ apikey: 'VewaTYf7Ez760L4rXENRplvTlORi4a0zF4TLPa1kjyfW' }),
            url: 'https://api.us-east.text-to-speech.watson.cloud.ibm.com/instances/85e6d5db-e78e-4bf9-8172-a388eb77e033'
        });
        const params = {
            text: texto,
            voice: 'pt-BR_IsabelaV3Voice', // NEURAL BRAZILIAN VOICE TECHNOLOGY
            accept: 'audio/wav'
        };

        textToSpeech
            .synthesize(params)
            .then(response => {
                const audio = response.result;
                return textToSpeech.repairWavHeaderStream(audio);
            })
            .then(repairedFile => {
                fs.writeFileSync('./public/upload/' + idcomentario + 'audio.wav', repairedFile);
                console.log(idcomentario + 'audio.wav foi inserido!');
            })
            .catch(err => {
                console.log(err);
            });

        textToSpeech.synthesizeUsingWebSocket(params);
    })
});

app.listen(port, () => console.log('-->Processando...'));