var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var amazon = require('../lib')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

var client = amazon.createClient({
  awsTag: process.env.AWS_TAG,
  awsId: process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET
});

// simulate database
var carts = {};

app.get('/api/search', function (req, res) {
  client.itemSearch({
    keywords: req.query.q,
    ResponseGroup: 'Medium'
  }).then(function(results){
    res.json(results);
  }).catch(function(err){
    res.status(500).json(err);
  });
});

app.get('/api/product/:asin', function (req, res) {
  client.itemLookup({
    idType: 'ASIN',
    itemId: req.params.asin,
    ResponseGroup: 'Medium'
  }).then(function(results) {
    res.json(results);
  }).catch(function(err) {
    res.status(500).json(err);
  });
});

app.post('/api/cart/', function (req, res) {
  client.cartCreate({ items: [req.body] }).then(function(results) {
    carts[results.Cart.CartId] = results.Cart.HMAC;
    res.json(results);
  }).catch(function(err) {
    res.status(500).json(err);
  });
});

app.put('/api/cart/:cartId', function (req, res) {
  client.cartAdd({
    CartId: req.params.cartId,
    HMAC: carts[req.params.cartId],
    items: [req.body]
  }).then(function(results) {
    res.json(results);
  }).catch(function(err) {
    res.status(500).json(err);
  });
});

app.get('/api/cart/:cartId', function (req, res) {
  client.cartGet({
    CartId: req.params.cartId,
    HMAC: carts[req.params.cartId]
  }).then(function(results) {
    res.json(results);
  }).catch(function(err) {
    res.status(500).json(err);
  });
});

app.listen(3000, function () {
  console.log('app listening on port 3000');
});