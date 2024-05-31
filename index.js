const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const AppointmentService = require('./services/AppointmentService')

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/agendamento', {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false 
})

app.get('/', (req, res) => {
    res.render("index");
})

app.get('/getcalendar', async (req, res) => {
    const results = await AppointmentService.GetAll(false)
    res.json(results)
})

app.get('/register', (req, res) => {
    res.render("create");
})

app.post('/create', async (req, res) => {
    const status = await AppointmentService.Create(
        req.body.name, 
        req.body.email, 
        req.body.description, 
        req.body.cpf, 
        req.body.date, 
        req.body.time,
        req.body.finished
    )

    if(status){
        res.send('Consulta criada com sucesso!')
    }
    else {
        res.send('Ocorreu uma falha!')
    }
})

app.get('/event/:id', async(req, res) => {
    const { id } = req.params
    const appointment = await AppointmentService.GetById(id)
    
    res.render('event', {appo: appointment})
})

app.post('/finish', async(req, res) => {
    const { id } = req.body.id
    const result = await AppointmentService.Finish(id)
    res.redirect('/')
})

app.get('/list', async(req, res) => {
    const appointments = await AppointmentService.GetAll(true)
    res.render('list', {appointments})
})

app.get('/searchresult', async(req, res) => {
    const query  = req.query.search

    const appointments = await AppointmentService.Search(query)
    res.render('list', {appointments})
})

const pollTime = (minutes) => minutes * 60000

setInterval( async () =>{
    await AppointmentService.SendNotification()
}, pollTime(5))

app.listen(8080, () => {});