// const ModbusTcpIpClient = require('modbus-tcp-ip-client')

// const address = "192.167.88.110"
// const port = "502"
// const unitId = "1"
// const timeout = "50000"

const Modbus = require('jsmodbus')
const net = require('net')
const host = "192.168.88.110";
const  port = 502;
const unitId = 1;

const options = {
'host' : host,
'port' : port
}

const socket = new net.Socket()
const client = new Modbus.client.TCP(socket, unitId) 

socket.on('close', () => {
    clearInterval(intervalId);
    console.log('Connection closed, polling stopped');
    connectToServer();
});

socket.on('error', (err) => {
    clearInterval(intervalId);
    console.error('Socket error:', err);
});


// socket.on('connect', function () {
    
//     client.readCoils(0, 13).then(function (resp) {
//     client.readHoldingRegisters(0,2).then((res)=> console.log(res))
//     console.log(resp);
    
//     }, console.error);
    
//     });   

// socket.connect(port, host, () => {
//         console.log('Connected to server')});

        function connectSocket(socket, port, host) {
            return new Promise((resolve, reject) => {
                socket.connect(port, host, () => {
                    resolve(); // Подключение успешно
                });
        
                socket.on('error', (err) => {
                    reject(err); // Произошла ошибка
                });
            });
        }
        
        async function connectToServer() {     
            try {
                await connectSocket(socket, 502, '192.168.88.110');
                try{
                    intervalId = setInterval(() => {
                        client.readHoldingRegisters(0, 2)
                            .then((res) => {
                                console.log(res.response)
                            })
                            .catch((err) => {
                                console.error('Error reading registers:', err)
                                clearInterval(intervalId)
                                // socket.end()
                            });
                    }, 2000);  
                }
                catch (err){
                    console.error('Interval error:', err);
                }
                
              
                // Дальнейшие действия после успешного подключения
            } catch (err) {
                console.error('Failed to connect:', err);
            }
        }
        connectToServer()
      
