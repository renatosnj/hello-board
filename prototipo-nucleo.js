/**
 * Created by renato on 14/03/16.
 */
"use strict";
hello_board(function (arg) {
    var app = require('express')(),
        http = require('http').Server(app),
        io = require('socket.io')(http);
    this.placa = {};

    io.on('connection', function (socket) {
        var idReceptor = 'Comando para Galileo',
            idResposta = 'Resposta da Galileo',
            notFoundCommand = "Galileo Não Entendeu";

        /**
         * Tratando um comando recebido
         */
        socket.on(idReceptor, function (comando) {

            // Padronizando string do coamndo
            comando = comando.trim().toLowerCase();

            //Executando comando correspondente
            if (placa.hasOwnProperty(comando)) {
                var retorno = placa[comando]();
                io.emit(idResposta, retorno);
            } else {
                io.emit(idResposta, notFoundCommand);
            }
        });
    });

});
