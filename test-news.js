const url = `https://finnhub.io/api/v1/news?category=general&token=d9b6j61r01qmk4gkeso0d9b6j61r01qmk4gkesog`;
fetch(url).then(r=>r.json()).then(d => console.log("Length:", d.length, d.slice ? d.slice(0,1) : d)).catch(console.error);
