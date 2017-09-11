const Telegraf = require('telegraf');
const app = new Telegraf("419266091:AAGUlcVsm6F-35UOHGoB7Tp03AZGvNISm-I");

app.hears('hi', ctx => {
  return ctx.reply('Hey!');
});

app.startPolling();