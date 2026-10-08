import https from 'https';
import fs from 'fs';

function fetchPage(path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'in.atomy.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

function extractGoods(htmlContent) {
  if (!htmlContent) return null;
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

// Read mockData to find all product IDs starting with D
const mockContent = fs.readFileSync('src/data/mockData.js', 'utf8');
const idRegex = /id:\s*["'](D[0-9A-Za-z]+)["']/g;
const ids = new Set();
let m;
while ((m = idRegex.exec(mockContent)) !== null) {
  ids.add(m[1]);
}

const idList = [...ids];
console.log(`Found ${idList.length} product IDs starting with D in mockData:`, idList);

async function run() {
  const results = {};
  let successCount = 0;

  for (let i = 0; i < idList.length; i++) {
    const id = idList[i];
    process.stdout.write(`[${i + 1}/${idList.length}] Fetching ${id}... `);
    const html = await fetchPage(`/product/${id}`);
    if (!html) {
      console.log('Page not found (404/error)');
      continue;
    }

    const goods = extractGoods(html);
    if (!goods) {
      console.log('No __GOODS__ object found');
      continue;
    }

    const gInfo = goods.gdGoods?.goodsInfo || {};
    const bottomList = goods.gdGoodsBottomList || {};
    const details = bottomList['2000001'] || [];
    
    // Find product information description
    const prodInfoItem = details.find(d => (d.areaTitle || '').toLowerCase().includes('product') || (d.goodsAreaNm || '').toLowerCase().includes('detail')) || details[0];
    const goodsDesc = prodInfoItem?.goodsDesc || '';

    // Extract all image URLs from goodsDesc
    const brochureImages = [...goodsDesc.matchAll(/src=["']([^"']+)["']/gi)].map(x => x[1]);

    // Extract gallery images
    const galleryImages = (goods.gdGoodsImgList || []).map(img => {
      const p = img.imgPath || '';
      return p.startsWith('http') ? p : `https://image.atomy.com${p}`;
    });

    // Extract precautions or cautions if available
    const precautionsItem = details.find(d => (d.areaTitle || '').toLowerCase().includes('precaution'));
    const precautions = precautionsItem?.goodsDesc || '';

    results[id] = {
      id: id,
      name: gInfo.goodsNm || goods.gdGoods?.goodsNm || '',
      price: gInfo.nomeSalePrice || gInfo.custSalePrice || 0,
      pv: gInfo.pvPrice || 0,
      weight: gInfo.weight || '',
      volumeDesc: gInfo.volumnDesc || '',
      baseImage: gInfo.baseImgPath ? (gInfo.baseImgPath.startsWith('http') ? gInfo.baseImgPath : `https://image.atomy.com${gInfo.baseImgPath}`) : '',
      galleryImages: galleryImages,
      brochureImages: brochureImages,
      goodsDescHtml: goodsDesc,
      precautions: precautions
    };

    successCount++;
    console.log(`OK! "${results[id].name}" - ${brochureImages.length} brochure images, ${galleryImages.length} gallery images`);

    // small delay to be polite to the server
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nFinished fetching! Successfully extracted official details for ${successCount}/${idList.length} products.`);
  fs.writeFileSync('src/data/officialProductDetails.json', JSON.stringify(results, null, 2));
  console.log('Saved to src/data/officialProductDetails.json');
}

run();
