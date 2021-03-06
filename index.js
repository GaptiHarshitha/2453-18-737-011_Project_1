const express = require('express');
const app = express();

//Connecting server file for AWT
let server = require('./server');
let config = require('./config');
let middleware = require('./middleware');
const response = require('express');


//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//for mongodb
const MongoClient = require('mongodb').MongoClient;


// DATABASE CONNECTION 

const url = 'mongodb://127.0.0.1:27017';
const dbname = "hospitalManagement";
let db

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database: ${dbname}`);
});

// FECTING HOSPITAL DETAILS
app.get('/hospital', middleware.checkToken, (req, res) => {
    console.log("Fetching data from hospital collection");
    const data = db.collection("hospital").find().toArray()
        .then(result => res.json(result));
});

// FECTING VENTILATION DETAILS
app.get('/ventilators', middleware.checkToken, (req, res) => {
    console.log("Ventilator Information");
    const data = db.collection("ventilators").find().toArray()
        .then(result => (res.json(result)));
});
 
//SEARCH VENTILATORS BY STATUS
app.post('/searchventbystatus', middleware.checkToken, (req, res) => {
    const status = req.query.status;
    console.log(status);
    const ventillatordetails = db.collection('ventilators')
        .find({ "status": status }).toArray().then(result => res.json(result));
});

//SEARCH VENTILATORS BY hospital name
app.post('/searchventbyname', middleware.checkToken, (req, res) => {
    const name = req.query.name;
    console.log(name);
    const ventilatordeatils = db.collection('ventilators')
        .find({ 'name': new RegExp(name, 'i') }).toArray().then(result => res.json(result));
});

//SEARCH HOSPITAL BY hospital name
app.post('/searchhospital', middleware.checkToken, (req, res) => {
    const name = req.query.name;
    console.log(name);
    const ventilatordeatils = db.collection('hospital')
        .find({ 'name': new RegExp(name, 'i') }).toArray().then(result => res.json(result));
});

//ADD VENTILATOR BY STATUS AND ID
app.post('/addvent', (req, res) => {
    const hid = req.query.hid;
    const ventid = req.query.ventid;
    const status = req.query.status;
    const name = req.query.name;
    console.log("adding ventilator, please wait a moment");
    const item = { "hid": hid, "ventilatorid": ventid, "status": status, "name": name };
    db.collection("ventilators").insertOne(item, function (err, result) {
        res.json("inserted successfully");
    });
});

//UPDATE THE VENTILATOR DETAILS BY VENTILATORID
app.put('/updateventilator', middleware.checkToken, (req, res) => {
    const ventid = { ventid: req.query.ventid };
    console.log(ventid);
    const newvalues = { $set: { status: req.query.status } };
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilators").updateOne(ventid, newvalues, function (err, result) {
        res.json('updated one document');
        if (err) throw err;
    });
});


//DELETE THE VENTILATOR DETAILS BY VENTIid
app.delete('/deletevent', middleware.checkToken, (req, res) => {
    const ventid = req.query.ventid;
    console.log(ventid);
    const temp = { "ventilatorid": ventid };
    db.collection("ventilators").deleteOne(temp, function (err, obj) {
        if (err) throw err;
        res.json("deleted one element");
    });
});

//FETCHING THE VENTILATOR BY STATUS and NAME
app.get('/searchventilators', (req, res) => {
    const status = req.query.status;
    const name = req.query.name;
    console.log("searching ventilators, please wait a moment");
    const data = db.collection("ventilators").find({ "name": name }, { "status": status }).toArray().then(result => res.send(result));
    
});

app.listen(9000, (req, res) => {
    console.log("working well");
});
