/******************************************************************************/
/*                  IMPORTACOES E VARIAVEIS COMPARTILHADAS                    */
/******************************************************************************/
"use strict";
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

// Tipo de codificacao ao abrir os aquivos na placa
var fileOptions = {encoding: 'ascii'};

// Variavel auxiliar para testes fora da placa
var dirname = __dirname;
var root = dirname + '/root';
//var temp_url = dirname + '/temp.txt';

/******************************************************************************/
/*            FUNCOES RELACIONADAS A ESCRITA DE ARQUIVOS NA PLACA             */
/******************************************************************************/

var exportGpio = function (gpio_nr) {
    fs.writeFile(root + '/sys/class/gpio/export', gpio_nr, fileOptions,
        function (err) {
            if (err) {
                console.log("Erro ao exportar o pino %d, provavelmente ja foi" +
                    "exportado.", gpio_nr);
            }
        });
};

var setGpioDirection = function (gpio_nr, direction) {
    fs.writeFile(root + "/sys/class/gpio/gpio" + gpio_nr + "/direction",
        direction, fileOptions, function (err) {
            if (err) {
                console.log("Could'd set gpio" + gpio_nr + " direction to " +
                    direction + " - probably gpio not available via sysfs\n" + err);
            }
        }
        );
};

var setGpioIn = function (gpio_nr) {
    setGpioDirection(gpio_nr, 'in');
};

var setGpioOut = function (gpio_nr) {
    setGpioDirection(gpio_nr, 'out');
};

var setGpioDrive = function (gpio_nr, drive) {
    fs.writeFile(root + "/sys/class/gpio/gpio" + gpio_nr + "/drive",
        drive, fileOptions, function (err) {
            if (err) {
                console.log("Could'd set gpio" + gpio_nr + " drive to " +
                    /*direction +*/ " - probably gpio not available via sysfs\n" + err);
            }
        }
        );
};

var setGpioStrong = function (gpio_nr) {
    setGpioDrive(gpio_nr, 'strong');
};


// pass callback to process data asynchroniously
var readGpio = function (gpio_nr, callback) {
    var value = "";
    fs.readFile("/sys/class/gpio/gpio" + gpio_nr + "/value", fileOptions,
        function (err, data) {
            if (err) {
                console.log("Error reading gpio" + gpio_nr);
            }
            value = data;
            callback(data);
        }
        );
    return value;
};

var writeGpio = function (gpio_nr, value) {
    fs.writeFile(root + "/sys/class/gpio/gpio" + gpio_nr + "/value", value, fileOptions,
        function (err, data) {
            if (err) {
                console.log("Writing " + gpio_nr + " " + value + "\n" + err);
            }
        }
    );
};

// Nomeando pinos da placa
var sensor = 37;
// GPIO's necessarios para habilitar led 13 da placa
var led = 39;
var mux = 55;
var configurarRecursosDaPlaca = function () {
    // Configurando MUX
    exportGpio(mux);
    setGpioOut(mux);
    setGpioStrong(mux);
    writeGpio(mux, '1');

    // Configurando LED
    exportGpio(led);
    setGpioOut(led);
    writeGpio(led, '0');

    // Configurando Sensor
    exportGpio(sensor);
    setGpioOut(sensor);
    setGpioStrong(sensor);
    writeGpio(sensor, '0');

    console.log("Placa configurada com sucesso.");
}



var readSensor = function (gpio_nr, callback) {
    var value;
    var url;
    if (root === "") {
    } else {
        url = root + "/sys/class/gpio/gpio" + gpio_nr + "/value";
    }    
    
    fs.readFile(url, fileOptions, 
        function (err, data) {
            if (err) {
                console.log("Error reading gpio" + gpio_nr);
            }
            value = data;
            callback(data);
        }
    );
    return value;
};

/******************************************************************************/
/*                       CONFIGURACOES DO SERVIDOR                            */
/******************************************************************************/

configurarRecursosDaPlaca();

// Retorno da pagina inicial
app.get('/', function (req, res) {
    res.sendFile(dirname + '/index.html');
});

// Inicie o servidor ouvindo na porta 3000
http.listen(process.env.PORT, process.env.IP, function () {
    console.log('Servidor iniciado.\nAceitando requisicoes na porta '+ process.env.PORT +'.');
});


/******************************************************************************/
/*                TRATANDO CONEXOES COM O SEVIDOR SOCKET.IO                   */
/******************************************************************************/

io.on('connection', function (socket) {

    /**
     * Tratando um comando recebido
     */
    socket.on('Comando para Galileo', function (comando) {
        
        // Padronizando string do coamndo
        comando = comando.trim().toLowerCase();
        
        //Executand comando correspondente
        if (comando === "galileu ligar") {
            writeGpio(led, '1');
            io.emit('Resposta da Galileo', "Ligando LED da Galileu");
            
        } else if (comando === "galileu desligar") {
            writeGpio(led, '0');
            io.emit('Resposta da Galileo', "Desligando LED da Galileu");
            
        } else if (comando === "galileu temperatura") {
            var data = readSensor(sensor, function(valor){
                io.emit('Resposta da Galileo', "A temperatura atual é " + valor 
                    + " graus.");
            });
            
        } else {
            io.emit('Resposta da Galileo', "Galileo Não Entendeu");
        }
    });
});
