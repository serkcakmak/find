const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const queryOptions = { period1: '2023-01-01', period2: '2023-02-01', interval: '1d' };
    const result = await yahooFinance.historical('AAPL', queryOptions);
    console.log(result.slice(0, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
