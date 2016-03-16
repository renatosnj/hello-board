/**
 * Created by renato on 14/03/16.
 */
"use strict";
var MODULE = (function () {

    /*
     * Declaracao de Variaveis globais e Importacoes
     */
    // Escrita e leitura de arquivos
    // Importando Modulo File System para leitura e escrita de arquivos
    var fs = require('fs'),
    // Tipo de codificacao para abrir os aquivos na placa
        fileOptions = {encoding: 'ascii'},

    // Variavel auxiliar de enredecamento para testes fora da placa
        dirname = __dirname,
        root = dirname + '/root',
    //var temp_url = dirname + '/temp.txt'

    // Definicoes dos pinos (Funcao x Pino)
        sensor = 37,
    // GPIO's necessarios para habilitar led 13 da placa
        led = 39,
        mux = 55;


    /*
     *   Definindo metodos privados
     */
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

    /**
     * Define a intensidade??? de um GPIO como strong
     * @param {string} gpio_nr - O numero do GPIO
     */
    var setGpioStrong = function (gpio_nr) {
        setGpioDrive(gpio_nr, 'strong');
    };

    var board = {};
    /**
     * Le o valor de um Sensor
     * @param {string} gpio_nr - O numero do GPIO
     * @param {function} callback - Uma funcao que se utilizara do valor do Sensor que sera passado por parametro
     * @return {string} Valor do sensor
     */
    board.readSensor = function (gpio_nr, callback) {
        var value,
            url;
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

    /**
     * Escreve o valor de um GPIO
     * @param {string} gpio_nr - O numero do GPIO
     * @param {string} value - Valor  para ser escrito no GPIO
     */
    board.writeGpio = function (gpio_nr, value) {
        fs.writeFile(root + "/sys/class/gpio/gpio" + gpio_nr + "/value", value, fileOptions,
            function (err, data) {
                if (err) {
                    console.log("Writing " + gpio_nr + " " + value + "\n" + err);
                }
            }
        );
    };

    /**
     * Le o valor de um GPIO
     * @param {string} gpio_nr - O numero do GPIO
     * @param {function} callback - Uma funcao que se utilizara do valor do FPIO que sera passado por parametro
     * @return {string} Valor do GPIO
     */
    board.readGpio = function (gpio_nr, callback) {
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

    /**
     * Executa os passos necessarios para inicializar a placa corretamente.
     */
    board.inicializarPlaca = function () {
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
        writeGpio(sensor, "0");

        console.log("Placa configurada com sucesso.");
    };
    board.test = function () {
        console.log("Funcionou")
    };

    return board;
}());