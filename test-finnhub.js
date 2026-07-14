const from = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // 30 days
const to = Math.floor(Date.now() / 1000);
const symbol = "AAPL";
const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=d9b6j61r01qmk4gkeso0d9b6j61r01qmk4gkesog`;
fetch(url).then(r=>r.json()).then(console.log).catch(console.error);
