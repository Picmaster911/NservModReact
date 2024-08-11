var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const fs = require("fs");
const unitId = 1;

function ReadConfig() {
    return new Promise((resolve, reject) => {
        fs.readFile("./config.json", "utf8", (error, data) => {
            if (error) {
                reject(error);
            }
            resolve(JSON.parse(data))
        });
    })
}


const Modbus = require('jsmodbus')
const net = require('net')

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

let connected = false;

const socket = new net.Socket()
const client = new Modbus.client.TCP(socket, unitId)

socket.on('close', () => {
    console.log('Connection closed, polling stopped');
    connectToServer();
    connected = false;
});

socket.on('error', (err) => {
    console.error('Socket error:', err);
});


 async function connectSocket(socket, port, host) {
    return new Promise((resolve, reject) => {
        socket.connect(port, host, () => {
            resolve(); // Подключение успешно
        });

        socket.on('error', (err) => {
            reject(err); // Произошла ошибка
        });
    });
}

function convertToFloat(arr) {
    let buf = new ArrayBuffer(4);
    let view = new DataView(buf);
    arr.forEach((item, index) => {
        view.setUint8(item, index);
    });
    var num = view.getFloat32(0);
    // Done
    console.log(num);
}

async function connectToServer() {
    ReadConfig()
        .then((config) => {
            return connectSocket(socket, config.port, config.ip);
        })
        .then(() => {
            console.log("Connected to device");
            connected = true;
        })
        .catch((err) => {
            console.error('Failed to connect:', err);
        });
}

connectToServer();

app.get("/read-data", async (req, res) => {
    try {
        client.readHoldingRegisters(0, 2)
            .then((resFromDevice) => {
                console.log(resFromDevice.response)
                res.json({
                    data: resFromDevice.response,
                    online: connected.toString()
                });
            })
            .catch((err) => {
                console.error('Error reading registers:', err)
                res.status(500).send("Internal Server Error");
            });
    }
    catch (error) {
        console.error("Error reading data:", error);
        res.status(500).send("Internal Server Error");
    }
})

app.get("/test:id", async (req, res) => {
    const id = req.params.id;
    client.readHoldingRegisters(id, 1)
    .then((resFromDevice) => {
        console.log(resFromDevice.response)
        res.json({
            data: resFromDevice.response,
            online: connected.toString()
        });
    })
    .catch((err) => {
        console.error('Error reading registers:', err)
        res.status(500).send("Internal Server Error");
    });
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
