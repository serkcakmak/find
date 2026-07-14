import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function run() {
  const result = await yahooFinance.search('markets');
  console.log(JSON.stringify(result.news.slice(0, 2), null, 2));
}

run();
