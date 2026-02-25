const express = require('express');
const got = require('got');
const path = require('path'); // Needed to find the HTML file
const metascraper = require('metascraper')([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')()
]);

const app = express();
app.use(express.json());

// CONFIG: Your IDs
const AMZN_TAG = 'wishlist0747-20';      
const EBAY_CAMP_ID = '5339143324';      
const IA_PUB_ID = '1076714';             

// Serve the index.html from the ROOT folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/scrape', async (req, res) => {
  try {
    const { targetUrl } = req.body;
    
    // LAZADA FAST MODE
    if (targetUrl.includes('lazada.ph')) {
        return res.json({
            title: "Lazada Gift Item",
            image: "https://logos-world.net/wp-content/uploads/2022/05/Lazada-Logo.png",
            url: `https://ad.involve.asia/track/click?u=${encodeURIComponent(targetUrl)}&pub_id=${IA_PUB_ID}`
        });
    }

    const apiKey = '9c3d209886ae817c47d9010e44103cee'; 
    const proxyUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render=true`;
    
    const response = await got(proxyUrl, { timeout: 40000 });
    const { body: html, url } = response;
    const metadata = await metascraper({ html, url });
    
    let finalUrl = targetUrl;
    if (targetUrl.includes('amazon.com')) {
        finalUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}tag=${AMZN_TAG}`;
    } else if (targetUrl.includes('ebay.com')) {
        finalUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}campid=${EBAY_CAMP_ID}&customid=wishlist_app&toolid=10001&mkevt=1`;
    } else if (targetUrl.includes('shopee.ph') || targetUrl.includes('shein.com')) {
        finalUrl = `https://ad.involve.asia/track/click?u=${encodeURIComponent(targetUrl)}&pub_id=${IA_PUB_ID}`;
    }

    res.json({
      title: metadata.title || "Gift Item Found",
      image: metadata.image || "https://via.placeholder.com/150",
      url: finalUrl 
    });
  } catch (error) {
    res.json({
        title: "Store Gift Item",
        image: "https://via.placeholder.com/150",
        url: `https://ad.involve.asia/track/click?u=${encodeURIComponent(req.body.targetUrl)}&pub_id=${IA_PUB_ID}`
    });
  }
});

// Important: Hostinger automatically assigns a port, so we use process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));