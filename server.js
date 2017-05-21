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
app.use(express.static('public', {extensions: ['html']}));

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

var monster_it_sales_confirmEmailQuery = {};
app.get('/signup_monster_it_sales', function(request, response) {
  var email = request.query.email;
  if (emailValidator.validate(email)) {
    var secret = crypto.randomBytes(64).toString('hex');
    monster_it_sales_confirmEmailQuery[secret] = email;

    var mailOptions = {
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
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
      from: 'Blast Notifications <blasts@blastnotifications.com>',
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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
    delete metacritic_xboxone_confirmEmailQuery[secret];
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
