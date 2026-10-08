import https from 'https';

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'in.atomy.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

function extractGoods(htmlContent) {
  const marker = 'overpass.require.define("__GOODS__", JSON.parse("';
  const start = htmlContent.indexOf(marker);
  if (start === -1) return null;
  const jsonStart = start + marker.length - 1;
  const markerEnd = '"));';
  const end = htmlContent.indexOf(markerEnd, jsonStart);
  if (end === -1) return null;
  const rawQuotedString = htmlContent.substring(jsonStart, end + 1);
  try {
    const unescaped = JSON.parse(rawQuotedString);
    return JSON.parse(unescaped);
  } catch (e) {
    return null;
  }
}

async function run() {
  const ids = ['D00101', 'D00281', 'D00207', 'D00501'];
  for (const id of ids) {
    const html = await fetchPage(`/product/${id}`);
    const g = extractGoods(html);
    if (g && g.gdGoodsBottomList && g.gdGoodsBottomList['2000001']) {
      const desc = g.gdGoodsBottomList['2000001'][0]?.goodsDesc || '';
      console.log(`=== ${id} (${g.gdGoods?.goodsNm}) ===`);
      console.log('Images in goodsDesc:');
      const imgMatches = [...desc.matchAll(/src=["']([^"']+)["']/gi)].map(m => m[1]);
      console.log(imgMatches);
    } else {
      console.log(`=== ${id}: NO GOODS DESC ===`);
    }
  }
}

run();
