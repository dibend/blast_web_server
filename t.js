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
    console.log(email + ' confirmation sent');
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
    console.log(email + ' confirmed');
    delete metacritic_movies_confirmEmailQuery[secret];
  } else {
    response.status(404);
    response.sendFile(path.join(__dirname+'/public/404.html'));
  }
});
