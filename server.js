'use strict';
var fs = require('fs');
var express = require('express');
var cors = require('cors');
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
app.use(cors());
app.use(compression());
app.use(express.static('public', {extensions: ['html']}));

function getIP(request) {
  return (request.headers['x-forwarded-for'] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress).split(",")[0];
}

app.get('/track.png', function(request, response) {
  var ip = getIP(request);
  console.log(ip + ' ' + request.query.email + ' loaded ' + request.query.blast + ' blast at ' + (new Date().toUTCString()));
  response.send();
});

app.get('/redir', function(request, response) {
  if(request.query.url) {
    var ip = getIP(request);
    console.log(ip + ' opened ' + request.query.url + ' at ' + (new Date().toUTCString()));
    response.redirect(request.query.url);
  } else {
    response.redirect('/');
  }
});

var ws_confirmEmailQuery = {};
app.get('/signup_ws', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    ws_confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete ws_confirmEmailQuery[secret]; 
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  } 
});

var daily_funder_confirmEmailQuery = {};
app.get('/signup_daily_funder', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex'); 
    daily_funder_confirmEmailQuery[secret] = email;
    
    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Daily Funder Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_daily_funder?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_daily_funder', function(request, response) {
  var secret = request.query.secret;
  if(secret in daily_funder_confirmEmailQuery) {
    var email = daily_funder_confirmEmailQuery[secret]; 
    
    db.query('INSERT IGNORE INTO daily_funder SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });
    
    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete daily_funder_confirmEmailQuery[secret]; 
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  } 
});

var fedbiz_confirmEmailQuery = {};
app.get('/signup_fedbiz', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    fedbiz_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm FedBizOpps Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_fedbiz?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_fedbiz', function(request, response) {
  var secret = request.query.secret;
  if(secret in fedbiz_confirmEmailQuery) {
    var email = fedbiz_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO fedbiz SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete fedbiz_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var coin_removals_confirmEmailQuery = {};
app.get('/signup_coin_removals', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    coin_removals_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Bittrex Coin Removal Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_coin_removals?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_coin_removals', function(request, response) {
  var secret = request.query.secret;
  if(secret in coin_removals_confirmEmailQuery) {
    var email = coin_removals_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO coin_removals SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete coin_removals_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var zerohedge_confirmEmailQuery = {};
app.get('/signup_zerohedge', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    zerohedge_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Zero Hedge News Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_zerohedge?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_zerohedge', function(request, response) {
  var secret = request.query.secret;
  if(secret in zerohedge_confirmEmailQuery) {
    var email = zerohedge_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO zerohedge SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete zerohedge_confirmEmailQuery[secret];
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
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
      from: config.from,
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
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
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
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete yahoo_nba_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var monster_it_sales_confirmEmailQuery = {};
app.get('/signup_monster_it_sales', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    monster_it_sales_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Monster IT Sales Jobs Notifications',
      text: 'Visit https://blastnotifications.com/confirm_monster_it_sales?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_monster_it_sales', function(request, response) {
  var secret = request.query.secret;
  if(secret in monster_it_sales_confirmEmailQuery) {
    var email = monster_it_sales_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO monster_it_sales SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete monster_it_sales_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var datpiff_confirmEmailQuery = {};
app.get('/signup_datpiff', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    datpiff_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm DatPiff Mixtape Notifications',
      text: 'Visit https://blastnotifications.com/confirm_datpiff?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_datpiff', function(request, response) {
  var secret = request.query.secret;
  if(secret in datpiff_confirmEmailQuery) {
    var email = datpiff_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO datpiff SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete datpiff_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var nasdaq_headlines_confirmEmailQuery = {};
app.get('/signup_nasdaq_headlines', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    nasdaq_headlines_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Nasdaq Market Headlines Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_nasdaq_headlines?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_nasdaq_headlines', function(request, response) {
  var secret = request.query.secret;
  if(secret in nasdaq_headlines_confirmEmailQuery) {
    var email = nasdaq_headlines_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO nasdaq_headlines SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete nasdaq_headlines_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var nasdaq_earnings_surprise_confirmEmailQuery = {};
app.get('/signup_nasdaq_earnings_surprise', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    nasdaq_earnings_surprise_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Nasdaq Earnings Surprise Notifications',
      text: 'Visit https://blastnotifications.com/confirm_nasdaq_earnings_surprise?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_nasdaq_earnings_surprise', function(request, response) {
  var secret = request.query.secret;
  if(secret in nasdaq_earnings_surprise_confirmEmailQuery) {
    var email = nasdaq_earnings_surprise_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO nasdaq_earnings_surprise SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete nasdaq_earnings_surprise_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var nasdaq_upcoming_ipo_confirmEmailQuery = {};
app.get('/signup_nasdaq_upcoming_ipo', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    nasdaq_upcoming_ipo_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Nasdaq Upcoming IPOs Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_nasdaq_upcoming_ipo?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_nasdaq_upcoming_ipo', function(request, response) {
  var secret = request.query.secret;
  if(secret in nasdaq_upcoming_ipo_confirmEmailQuery) {
    var email = nasdaq_upcoming_ipo_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO nasdaq_upcoming_ipo SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete nasdaq_upcoming_ipo_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var eb_manhattan_parties_confirmEmailQuery = {};
app.get('/signup_eb_manhattan_parties', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    eb_manhattan_parties_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Eventbrite Manhattan Parties Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_eb_manhattan_parties?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_eb_manhattan_parties', function(request, response) {
  var secret = request.query.secret;
  if(secret in eb_manhattan_parties_confirmEmailQuery) {
    var email = eb_manhattan_parties_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO eb_manhattan_parties SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete eb_manhattan_parties_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var executive_orders_confirmEmailQuery = {};
app.get('/signup_executive_orders', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    executive_orders_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm White House Executive Orders Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_executive_orders?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_executive_orders', function(request, response) {
  var secret = request.query.secret;
  if(secret in executive_orders_confirmEmailQuery) {
    var email = executive_orders_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO executive_orders SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete executive_orders_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var forex_factory_confirmEmailQuery = {};
app.get('/signup_forex_factory', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    forex_factory_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Forex Factory Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_forex_factory?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_forex_factory', function(request, response) {
  var secret = request.query.secret;
  if(secret in forex_factory_confirmEmailQuery) {
    var email = forex_factory_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO forex_factory SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete forex_factory_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var eb_la_parties_confirmEmailQuery = {};
app.get('/signup_eb_la_parties', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    eb_la_parties_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Eventbrite LA Parties Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_eb_la_parties?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_eb_la_parties', function(request, response) {
  var secret = request.query.secret;
  if(secret in eb_la_parties_confirmEmailQuery) {
    var email = eb_la_parties_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO eb_la_parties SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete eb_la_parties_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var metacritic_xboxone_confirmEmailQuery = {};
app.get('/signup_metacritic_xboxone', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    metacritic_xboxone_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Metacritic Xbox One Games Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_metacritic_xboxone?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_metacritic_xboxone', function(request, response) {
  var secret = request.query.secret;
  if(secret in metacritic_xboxone_confirmEmailQuery) {
    var email = metacritic_xboxone_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO metacritic_xboxone SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete metacritic_xboxone_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var metacritic_ps4_confirmEmailQuery = {}; 
app.get('/signup_metacritic_ps4', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    metacritic_ps4_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Metacritic PS4 Games Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_metacritic_ps4?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_metacritic_ps4', function(request, response) {
  var secret = request.query.secret;
  if(secret in metacritic_ps4_confirmEmailQuery) {
    var email = metacritic_ps4_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO metacritic_ps4 SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete metacritic_ps4_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var fox_news_videos_confirmEmailQuery = {};
app.get('/signup_fox_news_videos', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    fox_news_videos_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Fox News Videos Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_fox_news_videos?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_fox_news_videos', function(request, response) {
  var secret = request.query.secret;
  if(secret in fox_news_videos_confirmEmailQuery) {
    var email = fox_news_videos_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO fox_news_videos SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete fox_news_videos_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var metacritic_movies_confirmEmailQuery = {};
app.get('/signup_metacritic_movies', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    metacritic_movies_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Metacritic Movie Releases Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_metacritic_movies?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_metacritic_movies', function(request, response) {
  var secret = request.query.secret;
  if(secret in metacritic_movies_confirmEmailQuery) {
    var email = metacritic_movies_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO metacritic_movies SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete metacritic_movies_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var cnn_news_videos_confirmEmailQuery = {};
app.get('/signup_cnn_news_videos', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    cnn_news_videos_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm CNN News Videos Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_cnn_news_videos?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_cnn_news_videos', function(request, response) {
  var secret = request.query.secret;
  if(secret in cnn_news_videos_confirmEmailQuery) {
    var email = cnn_news_videos_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO cnn_news_videos SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete cnn_news_videos_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var msnbc_news_videos_confirmEmailQuery = {};
app.get('/signup_msnbc_news_videos', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    msnbc_news_videos_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm MSNBC News Videos Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_msnbc_news_videos?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_msnbc_news_videos', function(request, response) {
  var secret = request.query.secret;
  if(secret in msnbc_news_videos_confirmEmailQuery) {
    var email = msnbc_news_videos_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO msnbc_news_videos SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete msnbc_news_videos_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var reuters_tech_confirmEmailQuery = {};
app.get('/signup_reuters_tech', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    reuters_tech_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Reuters Tech News Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_reuters_tech?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_reuters_tech', function(request, response) {
  var secret = request.query.secret;
  if(secret in reuters_tech_confirmEmailQuery) {
    var email = reuters_tech_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO reuters_tech SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete reuters_tech_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var cnet_confirmEmailQuery = {};
app.get('/signup_cnet', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    cnet_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm CNET News Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_cnet?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_cnet', function(request, response) {
  var secret = request.query.secret;
  if(secret in cnet_confirmEmailQuery) {
    var email = cnet_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO cnet SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete cnet_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var the_verge_confirmEmailQuery = {};
app.get('/signup_the_verge', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    the_verge_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm The Verge Articles Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_the_verge?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_the_verge', function(request, response) {
  var secret = request.query.secret;
  if(secret in the_verge_confirmEmailQuery) {
    var email = the_verge_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO the_verge SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete the_verge_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var currency_direct_confirmEmailQuery = {};
app.get('/signup_currency_direct', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    currency_direct_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm Currencies Direct News Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_currency_direct?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_currency_direct', function(request, response) {
  var secret = request.query.secret;
  if(secret in currency_direct_confirmEmailQuery) {
    var email = currency_direct_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO currency_direct SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete currency_direct_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var itunes_songs_confirmEmailQuery = {};
app.get('/signup_itunes_songs', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    itunes_songs_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm iTunes Songs Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_itunes_songs?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_itunes_songs', function(request, response) {
  var secret = request.query.secret;
  if(secret in itunes_songs_confirmEmailQuery) {
    var email = itunes_songs_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO itunes_songs SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete itunes_songs_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var itunes_albums_confirmEmailQuery = {};
app.get('/signup_itunes_albums', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    itunes_albums_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm iTunes Albums Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_itunes_albums?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_itunes_albums', function(request, response) {
  var secret = request.query.secret;
  if(secret in itunes_albums_confirmEmailQuery) {
    var email = itunes_albums_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO itunes_albums SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete itunes_albums_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var itunes_free_apps_confirmEmailQuery = {};
app.get('/signup_itunes_free_apps', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    itunes_free_apps_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm iTunes Free Apps Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_itunes_free_apps?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_itunes_free_apps', function(request, response) {
  var secret = request.query.secret;
  if(secret in itunes_free_apps_confirmEmailQuery) {
    var email = itunes_free_apps_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO itunes_free_apps SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete itunes_free_apps_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

var itunes_paid_apps_confirmEmailQuery = {};
app.get('/signup_itunes_paid_apps', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    itunes_paid_apps_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: config.from,
      to: email,
      subject: 'Confirm iTunes Paid Apps Blast Notification',
      text: 'Visit https://blastnotifications.com/confirm_itunes_paid_apps?secret=' + secret + ' to verify your subscription!'
    };

    mailer.sendMail(mailOptions, function(err, res) {
      if(err) {
        console.log(err);
      }
      mailer.close();
    });
    console.log(getIP(request) + ' ' + email + ' confirmation sent at ' + (new Date().toUTCString()));
    response.redirect('/confirm.html');
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('/confirm_itunes_paid_apps', function(request, response) {
  var secret = request.query.secret;
  if(secret in itunes_paid_apps_confirmEmailQuery) {
    var email = itunes_paid_apps_confirmEmailQuery[secret];

    db.query('INSERT IGNORE INTO itunes_paid_apps SET ?', {email: email}, function (error) {
      if (error) {
        console.log(error);
      }
    });

    response.redirect('/confirmed.html');
    console.log(getIP(request) + ' ' + email + ' confirmed at ' + (new Date().toUTCString()));
    delete itunes_paid_apps_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});

app.get('*', function(request, response) {
  response.redirect('/');
});

http.createServer(function (req, res) {
  res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
  res.end();
}).listen(8080);

https.createServer(creds, app).listen(8443);
