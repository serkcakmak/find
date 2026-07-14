import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
yahooFinance.historical('AAPL', { period1: '2023-01-01', period2: '2023-02-01', interval: '1d' }).then(console.log).catch(console.error);
