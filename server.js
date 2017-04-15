var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var compression = require('compression');
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');
var validator = require('email-validator');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('./config');

var transport = nodemailer.createTransport(smtpTransport({
  host: config.ses_host,
  secureConnection: true,
  port: 465,
  auth: {
    user: config.ses_user,
    pass: config.ses_pass
  }
}));

var sslKey = fs.readFileSync('letsencrypt/privkey.pem', 'utf8');
var sslCert = fs.readFileSync('letsencrypt/cert.pem', 'utf8');
var ca = [
  fs.readFileSync('letsencrypt/chain.pem', 'utf8'), 
  fs.readFileSync('letsencrypt/fullchain.pem', 'utf8')
]; 

var creds = {
  key: sslKey,
  cert: sslCert,
  ca: ca
};

var app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/trade', function(request, response) {
  response.sendFile(path.join(__dirname+'/public/trade.html'));
});

var confirmEmailQuery = {};
app.post('/signup', function(request, response) {
  console.log(request.body);
  var email = request.body.email;
  if (validator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm?secret=' + secret + ' to verify your subscription!'
    };

    transport.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      transport.close();
    });

    console.log(confirmEmailQuery);
  }
  response.send('check inbox for confirmation email');
});

app.get('/confirm', function(request, response) {
  var secret = request.query.secret;
  if(secret in confirmEmailQuery) {
    var email = confirmEmailQuery[secret]; 
    console.log(email);
    response.send(email + ' confirmed');
    delete confirmEmailQuery[secret]; 
  } else {
    response.send('invalid');
  } 
});

app.get('*', function(request, response) {
  response.status(404);
  response.sendFile(path.join(__dirname+'/public/404.html'));
});

http.createServer(function (req, res) {
  res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
  res.end();
}).listen(8080);

https.createServer(creds, app).listen(8443);
