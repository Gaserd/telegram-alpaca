Hello everyone

Today we will show you how to make A very simple telegram bot. To do this, we will use the Node JS programming language.

I've already written how to install NodeJS, so just go here - https://gaserd.xyz/?go=all/how-create-stock-screener-on-node-js-ep1/

Before you start programming, let's prepare our workplace a little.

- creating a folder in which we will work
- making the `npm init` command
- creating a file `main.js`

To do this, you need to contact another bot - https://t.me/botfather enter the */new bot* command and follow the instructions. as soon as you create a bot, botfather will send you the key to your bot and save it.

Now let's open our still empty `main.js` and get down to business.

We will also need a certain number of npm packages, so let's install them all at once.
```
npm install date-fns @alpaca/alpaca-trade-api node-fetch telegraf
```

A lot of packages, of course, but with them we will do things much faster.
Now let's write some code.

```
const dateFns = require('date-fns')
const apiKeyId = 'PUT YOUR API KEY'
const secretKey = 'PUT YOUR SECRET KEY'
const Alpaca = require('@alpacahq/alpaca-trade-api')
const quickchart = require('quickchart-js')
const format = 'yyyy-MM-dd'
const alpaca = new Alpaca({
    keyId: apiKeyId,
    secretKey: secretKey,
    paper: true,
    usePolygon: false
})
const nodeFetch = require('node-fetch')

const BOT_TOKEN = 'PUT YOUR BOT TOKEN'
const { Telegraf } = require('telegraf')
```

What do we use here? If you have already met the bot for the token, then `apiKeyId` and `secretKey` may not be familiar to you, so these are the keys for the Alpaca API, thanks to which we will get quotes.

How do I get them? I've already written about it here - https://gaserd.xyz/?go=all/how-create-stock-screener-on-node-js-ep2-alpacaapi-date-fns-and/

As soon as you have received everything, insert your keys and continue development.
Let's create a couple of commands for the bot and try them out:

```
const bot = new Telegraf(BOT_TOKEN)
bot.start((ctx) => ctx.reply('Hey, wellcome to the board! 👋 This bot is able to show easy information about the promotion that interests you'))
bot.command('about', (ctx) => {
    ctx.reply(`Hey, my name @gaserd and i create this bot, because i like programming, trading and betting. I create blog about it https://gaserd.xyz and twitter https://twitter.com/gaserdgg`)
})
bot.launch()
console.log('telegram bot start 🆙')
```

Launch the bot with the command `node main.js` in your terminal and open the bot in Telegram, enter the `/about` command.
Well? Did the bot answer you? Really great!

But let's try to complicate the task, let the bot give us the latest data on the desired action.
```
bot.command('lastq', (ctx) => {
    const stock = getValueOfBotCommand(ctx.message.text, 'lastq')
    alpaca
        .lastQuote(stock)
        .then(data => {
            ctx.reply(`symbol - ${data.symbol}\nask price - ${data.last.askprice}\nbid price - ${data.last.bidprice}`)
        })
        .catch((e) => {
            console.log(e)
            ctx.reply('Error, pls send message @gaserd')
        })
})
```

Let's run through this code and tell you what's what.
As always, we initialize the bot's command and set parameters for it to respond to.
What is the function of `getValueOfBotCommand` ? It returns the action that the person wrote from the string.

```
function getValueOfBotCommand(string, command) {
    return string.replace(`/${command}`, '').replace(/ /g, '')
}
```

Then our code requests data from the Alpaca API and returns it to the user. Launch the bot and try it!
I think you have managed it, if something doesn't work out, write to any of my contacts.

Moving on, let's complicate another challenge will be to change the action in the form of pictures over the last month. Cool?

`quickCharts`,`date-fns` will help us with this.
```
bot.command('agg', (ctx) => {
    const stock = getValueOfBotCommand(ctx.message.text, 'agg')
    let today = new Date()
    const to = dateFns.format(today, format)
    today.setMonth(today.getMonth() - 1)
    const from = dateFns.format(today, format)

    alpaca
        .getAggregates(
            stock,
            'day',
            from,
            to
        ).then(data => {
            const results = data.results
            let labels = []
            let dataChart = []
                results.map(res => {
                    labels.push(dateFns.format(res.startEpochTime, format))
                    dataChart.push(res.closePrice)
                })

            const chart = {
                chart: {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: stock,
                            data: dataChart,
                            fill: false,
                            borderColor:'green',
                            pointRadius : 0
                        }]
                    }
                }
            }

            nodeFetch('https://quickchart.io/chart/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chart)
            })
                .then(res => res.json())
                .then(res => {
                    ctx.reply(res.url)
                })
                .catch(e => {
                    ctx.reply('Error, pls send message @gaserd')
                })


        })
        .catch(e => {
            console.log(e)
            ctx.reply('Error, pls send message @gaserd')
        })
})
```

Let's figure out what's going on here.

First we tell our bot to listen to the `agg` command, then we select two dates in the format we need, the date of today and the date a month ago, so we get the requested period of time - this is about 21 trading days.

After that, we collect data to a specific object, which we will later pass quick charts via the REST API, and then get a link to the graph that was generated.

I hope you have become a little clearer, and now what to expect, launch the bot and start playing.

That's it, here's the full code for your bot.

```
const dateFns = require('date-fns')
const apiKeyId = 'PUT YOUR API KEY'
const secretKey = 'PUT YOUR SECRET KEY'
const Alpaca = require('@alpacahq/alpaca-trade-api')
const format = 'yyyy-MM-dd'
const alpaca = new Alpaca({
    keyId: apiKeyId,
    secretKey: secretKey,
    paper: true,
    usePolygon: false
})
const nodeFetch = require('node-fetch')

const BOT_TOKEN = 'PUT YOUR BOT TOKEN'
const { Telegraf } = require('telegraf')

function getValueOfBotCommand(string, command) {
    return string.replace(`/${command}`, '').replace(/ /g, '')
}

const bot = new Telegraf(BOT_TOKEN)
bot.start((ctx) => ctx.reply('Hey, wellcome to the board! 👋 This bot is able to show easy information about the promotion that interests you'))
bot.help((ctx) => ctx.reply(`
/lastq {stock} - this command get last quotes for the stock which you input\n
/agg {stock} - this command get aggregates info for last 1 month\n
/about - command get ingo about this bot and who developer\n`))

bot.command('about', (ctx) => {
    ctx.reply(`Hey, my name @gaserd and i create this bot, because i like programming, trading and betting. I create blog about it https://gaserd.xyz and twitter https://twitter.com/gaserdgg`)
})

bot.command('lastq', (ctx) => {
    const stock = getValueOfBotCommand(ctx.message.text, 'lastq')
    alpaca
        .lastQuote(stock)
        .then(data => {
            ctx.reply(`symbol - ${data.symbol}\nask price - ${data.last.askprice}\nbid price - ${data.last.bidprice}`)
        })
        .catch((e) => {
            console.log(e)
            ctx.reply('Error, pls send message @gaserd')
        })
})

bot.command('agg', (ctx) => {
    const stock = getValueOfBotCommand(ctx.message.text, 'agg')
    let today = new Date()
    const to = dateFns.format(today, format)
    today.setMonth(today.getMonth() - 1)
    const from = dateFns.format(today, format)

    alpaca
        .getAggregates(
            stock,
            'day',
            from,
            to
        ).then(data => {
            const results = data.results
            let labels = []
            let dataChart = []
                results.map(res => {
                    labels.push(dateFns.format(res.startEpochTime, format))
                    dataChart.push(res.closePrice)
                })

            const chart = {
                chart: {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: stock,
                            data: dataChart,
                            fill: false,
                            borderColor:'green',
                            pointRadius : 0
                        }]
                    }
                }
            }

            nodeFetch('https://quickchart.io/chart/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chart)
            })
                .then(res => res.json())
                .then(res => {
                    ctx.reply(res.url)
                })
                .catch(e => {
                    ctx.reply('Error, pls send message @gaserd')
                })


        })
        .catch(e => {
            console.log(e)
            ctx.reply('Error, pls send message @gaserd')
        })
})

bot.launch()
console.log('telegram bot start 🆙')
```




