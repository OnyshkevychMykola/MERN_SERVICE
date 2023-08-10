const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500;
const cors = require('cors');
const {logger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const optionsCors = require('./config/corsOptions');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');
const cookieParser = require('cookie-parser');
//Handle options credentials check - before CORS!
//and fetch cookies credentials requirement
app.use(credentials);

//cross-origin resource sharing
app.use(cors(optionsCors));
//form data:
// content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({extended:false}));
//json
app.use(express.json());
//cookies middleware
app.use(cookieParser());
//static files
app.use('/',express.static(path.join(__dirname, '/public')));
//router
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));

app.use(logger);

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({error: '404 Not Found'});
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


