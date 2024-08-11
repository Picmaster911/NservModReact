//   "modbus": "^1.1.3",
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const modbus = require('modbus')
var ping = require('ping');
var net = require('net')
const cors = require('cors');

const device = modbus("192.168.88.110", "502", 1)

function pingDevice(myCallback) {
  var host = '192.168.88.110';
  ping.sys.probe(host, function (isAlive) {
    myCallback(isAlive)
  });

}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));



app.use('/', indexRouter);
app.use('/users', usersRouter);

async function readWithTimeout(device,adressHr, timeout) {
  return Promise.race([
    device.read(adressHr),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), timeout))
  ]);
}

app.get("/read-data", async (req, res) => {
  try {
    let myHoldingRegister = await readWithTimeout(device,'hr1', 3000);
    let myHoldingRegister1 = await readWithTimeout(device,'hr2', 3000);
    let myHoldingRegister2 = await readWithTimeout(device,'hr3', 3000);
    console.log(myHoldingRegister)
 
    res.json({
      data:  myHoldingRegister.toString(),
      data1: myHoldingRegister1.toString(),
      data2: myHoldingRegister2.toString(),
      online: device.stream.online.toString()
    });
  }
  catch (error) {
    console.error("Error reading data:", error);
    res.status(200).json({
      data: "error",
      online: error.message,
      message: error.message
    });
  }
})

app.get("/test:id", async (req, res) => {
  const id = req.params.id;  
  console.log("test", id);
  res.status(200).send(`Ok, received id: ${id}`);
}
)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use(function (req, res, next) {
  next(createError(404));
});


// Обработчик ошибок
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
