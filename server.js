/******************************************************************************/
/*                  IMPORTACOES E VARIAVEIS COMPARTILHADAS                    */
/******************************************************************************/
"use strict";
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var board = require('./board.js');

// Variavel auxiliar para testes fora da placa
var dirname = __dirname;
/******************************************************************************/
/*                       CONFIGURACOES DO SERVIDOR                            */
/******************************************************************************/

// Retorno da pagina inicial
app.get('/', function (req, res) {
    res.sendFile(dirname + '/index.html');
});

if(process.env.PORT !== undefined){
    // Inicie o servidor ouvindo na porta 3000
    http.listen(process.env.PORT, process.env.IP, function () {
        console.log('Servidor iniciado.\nAceitando requisicoes na porta '+ process.env.PORT +'.');
    });
} else {
    // Inicie o servidor ouvindo na porta 3000
    http.listen(3000, function () {
        console.log('Servidor iniciado.\nAceitando requisicoes na porta 3000.');
    });
}

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
            board.ligarLed();
            io.emit('Resposta da Galileo', "Ligando LED da Galileu");
            
        } else if (comando === "galileu desligar") {
            board.desligarLed();
            io.emit('Resposta da Galileo', "Desligando LED da Galileu");
            
        } else if (comando === "galileu temperatura") {
            board.lerSensor(function(valor){
                io.emit('Resposta da Galileo', "A temperatura atual é " + valor
                    + " graus.");
            });
            
        } else {
            io.emit('Resposta da Galileo', "Galileo Não Entendeu");
        }
    });
});
