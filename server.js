/******************************************************************************/
/*                  IMPORTACOES E VARIAVEIS COMPARTILHADAS                    */
/******************************************************************************/
/*globals $:false */

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

// Retornando pagina de Debug
app.get('/debug', function (req, res) {
        var i = 0;
    var len = board.debugger.length;
    var text = "";
    for (; i < len; i++) {
        text += "<li>" + board.debugger[i]() + "</li>";
    }
    res.write("<html><head>" +
        "<meta charset=\"utf-8\">" +
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
        "<script type=\"text//javascript\" src=\"http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js\"></script>" +
        "<script type=\"text//javascript\" src=\"http://netdna.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js\"></script>" +
        "<link href=\"http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">" +
        "<link href=\"http://pingendo.github.io/pingendo-bootstrap/themes/default/bootstrap.css\" rel=\"stylesheet\" type=\"text/css\">" +
        "</head><body>" +
        "<div class=\"section\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"page-header\"><h1 contenteditable=\"true\">Hello Board <font color=\"#777777\"><span style=\"font-size: 23.4px; line-height: 23.4px;\">Debugger</span></font></h1></div></div></div></div></div><div class=\"section\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-12\"><ul>"
        + text
        + "</ul></div></div></div></div></body></html>");
    res.end();
});

if (process.env.PORT !== undefined) {
    // Inicie o servidor ouvindo na porta 3000
    http.listen(process.env.PORT, process.env.IP, function () {
        console.log('Servidor iniciado.\nAceitando requisicoes na porta ' + process.env.PORT + '.');
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
    var idReceptor = 'Comando para Galileo',
        idResposta = 'Resposta da Galileo',
        notFoundCommand = "Galileo Não Entendeu",
        returnCommands = "Comandos da placa",
        requestCommands = "Comandos";

    /**
     * Tratando um comando recebido
     */
    socket.on(idReceptor, function (comando) {

        // Padronizando string do coamndo
        comando = comando.trim().toLowerCase();

        //Executando comando correspondente
        if (board.comandos.hasOwnProperty(comando)) {
            io.emit(idResposta, board.comandos[comando]());
        } else {
            io.emit(idResposta, notFoundCommand);
        }
    });

    /**
     * Tratando requisicao de comandos
     */
    socket.on(requestCommands, function () {
        var retorno = {},
        j = 1;
        for (var i in board.comandos) {
            retorno[j++] = i;
        }
        io.emit(returnCommands, JSON.stringify(retorno));

    });
});