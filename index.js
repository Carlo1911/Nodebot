const Telegraf = require('telegraf'); //Framework for telegram bot
const app = new Telegraf("419266091:AAGUlcVsm6F-35UOHGoB7Tp03AZGvNISm-I");
const {
    Markup
} = require('telegraf');
const axios = require('axios'); // add axios

let state = {}; //Para mantener los usuarios y sus estados

app.hears('hi', ctx => {
    return ctx.reply('Hey!');
});

app.command('top', ctx => {
    const userId = ctx.message.from.id;
    if (!state[userId])
        state[userId] = {};
    state[userId].command = 'top';
    return ctx.replyWithMarkdown(`Ingrese un nombre de subreddit para obtener los posts *top*.`);
});

app.command('hot', ctx => {
    const userId = ctx.message.from.id;
    if (!state[userId])
        state[userId] = {};
    state[userId].command = 'hot';
    return ctx.replyWithMarkdown('Ingrese un nombre de subreddit para obtener los posts *hot*.');
});

app.on('text', ctx => {
    const subreddit = ctx.message.text;
    const userId = ctx.message.from.id;
    const type = !state[userId] ? 'top' : state[userId].command ? state[userId].command : 'top';

    if (!state[userId])
        state[userId] = {};
    state[userId].index = 0;

    axios.get(`https://reddit.com/r/${subreddit}/${type}.json?limit=10`)
        .then(res => {
            const data = res.data.data;
            if (data.children.length < 1)
                return ctx.reply('El subreddit no se encontró.');

            const link = `https://reddit.com/${data.children[0].data.permalink}`;
            console.log(type);
            return ctx.reply(link,
                Markup.inlineKeyboard([
                    Markup.callbackButton('➡️ Siguiente', subreddit),
                ]).extra()
            );
        })
        .catch(ctx.reply('El subreddit no existe.'));
});

app.on('callback_query', ctx => {
    const subreddit = ctx.update.callback_query.data;
    const userId = ctx.update.callback_query.from.id;

    let type;
    let index;
    try {
        type = state[userId].command ? state[userId].command : 'top';
        index = state[userId].index;
    } catch (err) {
        return ctx.reply('Envíe un nombre de subreddit.');
    }

    ctx.answerCallbackQuery('Espere...');

    axios.get(`https://reddit.com/r/${subreddit}/${type}.json?limit=10`)
        .then(res => {
            const data = res.data.data;
            if (!data.children[index + 1])
                return ctx.reply('No hay más posts!');

            const link = `https://reddit.com/${data.children[index + 1].data.permalink}`;
            state[userId].index = state[userId].index + 1;
            return ctx.reply(link,
                Markup.inlineKeyboard([
                    Markup.callbackButton('➡️ Siguiente', subreddit),
                ]).extra()
            );
        })
        .catch(ctx.reply('El subreddit no existe.'));
});

app.startPolling();