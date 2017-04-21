var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var compression = require('compression');
var path = require('path');
var crypto = require('crypto');
var emailValidator = require('email-validator');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mysql = require('mysql');
var config = require('./config');

var mailer = nodemailer.createTransport(smtpTransport({
  host: config.ses_host,
  secureConnection: true,
  port: 465,
  auth: {
    user: config.ses_user,
    pass: config.ses_pass
  }
}));

var db = mysql.createPool({
  connectionLimit: 10,
  host: config.mysql_host,
  user: config.mysql_user,
  password: config.mysql_pass,
  database: config.mysql_db
});

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
app.use(express.static('public'));

app.get('/trade', function(request, response) {
  response.sendFile(path.join(__dirname+'/public/trade.html'));
});

app.get('/follow', function(request, response) {
  response.sendFile(path.join(__dirname+'/public/follow.html'));
});

var ws_confirmEmailQuery = {};
app.get('/signup_ws', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    ws_confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Worldstar Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_ws?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_ws', function(request, response) {
  var secret = request.query.secret;
  if(secret in ws_confirmEmailQuery) {
    var email = ws_confirmEmailQuery[secret]; 
    
    db.query('INSERT IGNORE INTO worldstar SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });
    
    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete ws_confirmEmailQuery[secret]; 
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  } 
});

var bloomberg_stock_confirmEmailQuery = {};
app.get('/signup_bloomberg_stock', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    bloomberg_stock_confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Bloomberg Stocks Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_bloomberg_stock?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_bloomberg_stock', function(request, response) {
  var secret = request.query.secret;
  if(secret in bloomberg_stock_confirmEmailQuery) {
    var email = bloomberg_stock_confirmEmailQuery[secret]; 
    
    db.query('INSERT IGNORE INTO bloomberg_stock SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });
    
    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete bloomberg_stock_confirmEmailQuery[secret]; 
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  } 
});

var bloomberg_currency_confirmEmailQuery = {};
app.get('/signup_bloomberg_currency', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    bloomberg_currency_confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Bloomberg Currency Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_bloomberg_currency?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_bloomberg_currency', function(request, response) {
  var secret = request.query.secret;
  if(secret in bloomberg_currency_confirmEmailQuery) {
    var email = bloomberg_currency_confirmEmailQuery[secret]; 
    
    db.query('INSERT IGNORE INTO bloomberg_currency SET ?', {email: email}, function (error) {
      if (error) { 
        console.log(error);
      }
    });
    
    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete bloomberg_currency_confirmEmailQuery[secret]; 
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  } 
});

var bloomberg_startup_confirmEmailQuery = {};
app.get('/signup_bloomberg_startup', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    bloomberg_startup_confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Bloomberg Startup Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_bloomberg_startup?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_bloomberg_startup', function(request, response) {
  var secret = request.query.secret;
  if(secret in bloomberg_startup_confirmEmailQuery) {
    var email = bloomberg_startup_confirmEmailQuery[secret]; 
    
    db.query('INSERT IGNORE INTO bloomberg_startup SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });
    
    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete bloomberg_startup_confirmEmailQuery[secret]; 
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  } 
});

var reuters_business_confirmEmailQuery = {};
app.get('/signup_reuters_business', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    reuters_business_confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Reuters Business Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_reuters_business?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_reuters_business', function(request, response) {
  var secret = request.query.secret;
  if(secret in reuters_business_confirmEmailQuery) {
    var email = reuters_business_confirmEmailQuery[secret]; 
    
    db.query('INSERT IGNORE INTO reuters_business SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });
    
    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete reuters_business_confirmEmailQuery[secret]; 
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  } 
});

var therealreal_chanel_bags_confirmEmailQuery = {};
app.get('/signup_therealreal_chanel_bags', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    therealreal_chanel_bags_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm The RealReal Chanel Bags Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_therealreal_chanel_bags?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_therealreal_chanel_bags', function(request, response) {
  var secret = request.query.secret;
  if(secret in therealreal_chanel_bags_confirmEmailQuery) {
    var email = therealreal_chanel_bags_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO therealreal_chanel_bags SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete therealreal_chanel_bags_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var gomovies_confirmEmailQuery = {};
app.get('/signup_gomovies', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    gomovies_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Go Movies Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_gomovies?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_gomovies', function(request, response) {
  var secret = request.query.secret;
  if(secret in gomovies_confirmEmailQuery) {
    var email = gomovies_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO gomovies SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete gomovies_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var yahoo_nfl_confirmEmailQuery = {};
app.get('/signup_yahoo_nfl', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    yahoo_nfl_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Yahoo NFL Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_yahoo_nfl?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_yahoo_nfl', function(request, response) {
  var secret = request.query.secret;
  if(secret in yahoo_nfl_confirmEmailQuery) {
    var email = yahoo_nfl_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO yahoo_nfl SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete yahoo_nfl_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var yahoo_nba_confirmEmailQuery = {};
app.get('/signup_yahoo_nba', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    yahoo_nba_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
      to: email,
      subject: 'Confirm Yahoo NBA Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_yahoo_nba?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(email + ' confirmation sent');
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_yahoo_nba', function(request, response) {
  var secret = request.query.secret;
  if(secret in yahoo_nba_confirmEmailQuery) {
    var email = yahoo_nba_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO yahoo_nba SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(email + ' confirmed');
    delete yahoo_nba_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
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
