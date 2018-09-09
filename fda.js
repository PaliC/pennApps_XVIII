var request = require('request');
var express = require('express');
var bParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.get('/', function (req, res) {
    request('https://api.fda.gov/drug/label.json?count=openfda.route.exact', function (error, response, body){
        // Print the Error if one occurred:
        console.log('error:', error);
        // Print the response Status Code if a response was received:
        console.log('statusCode:', response && response.statusCode);
        // Print the HTML Body for the FDA Request
        console.log('body:', body);
    });
