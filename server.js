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

// Retornando pagina de Debug
app.get('/debug', function (req, res) {
    res.write("<html><head>"+
        "<meta charset=\"utf-8\">"+
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
        "<script type=\"text//javascript\" src=\"http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js\"></script>"+
        "<script type=\"text//javascript\" src=\"http://netdna.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js\"></script>"+
        "<link href=\"http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">"+
        "<link href=\"http://pingendo.github.io/pingendo-bootstrap/themes/default/bootstrap.css\" rel=\"stylesheet\" type=\"text/css\">"+
        "</head><body>"+
        "<div class=\"section\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-12\"><div class=\"page-header\"><h1 contenteditable=\"true\">Hello Board <font color=\"#777777\"><span style=\"font-size: 23.4px; line-height: 23.4px;\">Debugger</span></font></h1></div></div></div></div></div><div class=\"section\"><div class=\"container\"><div class=\"row\"><div class=\"col-md-12\"><ul>LED:"
        + board.lerLED()
        + "<Status do LED>"
        + "<br>Temperatura Atual:"
        +  board.lerSensor()
        + "</ul></div></div></div></div></body></html>");
    res.end();
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
            io.emit('Resposta da Galileo', "A temperatura atual é " + board.lerSensor()
                + " graus.");
            
        } else {
            io.emit('Resposta da Galileo', "Galileo Não Entendeu");
        }
    });
});
