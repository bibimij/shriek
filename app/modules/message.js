var mongoose = require('../models/mongoose');
var MessageModel = mongoose.MessageModel;

var messageModule = function(socket) {

  /** Слушаем сообщение с фронта
  * @param data
  * @param data.user string логин юзера
  * @param data.channel string канал в который пишем (не обязательное)
  * @param data.text string текст сообщения
  * @param data.type string не обязательное, по умолчанию text
  */

  socket.on('message send', function (data) {

    // здесь еще нужно проверять на существование чата, если его нет — создавать

    var newMessage = MessageModel({
      username: data.username,
      channel: ( data.channel !== undefined ? data.channel : 'general' ), // если канал не пришёл, пишем в general
      text: data.text,
      type: ( data.type !== undefined ? data.type : 'text' ) // если не пришёл тип, то думаем, что это текст
    });

    newMessage.save({runValidators: true}, function (err, data) {

      var out = {};
      if (!err) {
        out.status = 'ok';
        out.message = data; // здесь будет запись из БД со всеми полями (см схему)
      } else {
        out.status = 'error';
        out.error_message = 'Ошибка создания сообщения';
      }

      if (out.status == 'ok') socket.broadcast.emit('message send', out); // броадкастим на всех, только если все прошло удачно
      socket.emit('message send', out);

    });

  });
}

module.exports = messageModule;
