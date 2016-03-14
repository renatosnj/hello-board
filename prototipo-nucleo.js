/**
 * Created by renato on 14/03/16.
 */
"use strict";
define('hello-board', function () {
    var app = require('express')();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    io.on('connection', function (socket) {
        var idReceptor = 'Comando para Galileo',
            idResposta = 'Resposta da Galileo';


        var placa = {};

        /**
         * Tratando um comando recebido
         */
        socket.on(idReceptor, function (comando) {

            // Padronizando string do coamndo
            comando = comando.trim().toLowerCase();

            //Executand comando correspondente
            if (placa.hasOwnProperty(comando)) {
                var retorno = placa[comando]();
                io.emit(idResposta, retorno);
            } else {
                io.emit(idResposta, "Galileo Não Entendeu");
            }
        });
    });

});
