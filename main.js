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
