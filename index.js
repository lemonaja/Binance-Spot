require("dotenv").config()
const WebSocket = require("ws");
const axios = require("axios");
const crypto = require("crypto");

const ws = new WebSocket(process.env.STREAM_URL + "btcusdt@bookTicker")

ws.onmessage = async (event) => {
    const obj = JSON.parse(event.data);
    console.log("Símbolo: " + obj.s);
    console.log("Preço: " + obj.a);

let isOpened = false;

const price = parseFloat(obj.a);
if(price < 19280 && !isOpened){
    console.log("Comprar");
    isOpened = true;
    newOrder("BTCUSDT", "0.001", "BUY")
}else if(price > 19635 && isOpened){
    console.log("Vender");
    isOpened = false;
    newOrder("BTCUSDT", "0.001", "SELL")
}
}

async function newOrder(symbol, quantity, side){
    const data = {symbol, quantity, side};
    data.type = "MARKET";
    data.timestamp = Date.now();

    const signature = crypto 
        .createHmac("sha256", process.env.SECRET_KEY)
        .update(new URLSearchParams(data).toString())
        .digest("hex");

    data.signature = signature;

    const result = await axios({
        method: "POST",
        url: process.env.API_URL + "/v3/order?" + new URLSearchParams(data),
        headers: { "X-MBX-APIKEY": process.env.API_KEY }
    })
    console.log(result.data);
}