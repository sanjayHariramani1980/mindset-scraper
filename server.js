const express = require('express');
const got = require('got');
const cors = require('cors');
const metascraper = require('metascraper')([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-url')()
]);

const app = express();

// This is the "Magic Key" that lets Hostinger talk to Render
app.use(cors()); 
app.use(express.json());

// 1. This fixes the "Not Found" error
app.get('/', (req, res) => {
    res.send("Scraper Engine is Online");
});

// 2. This is the main engine for your products
app.post('/scrape', async (req, res) => {
  try {
    const { targetUrl } = req.body;
    
    // Quick handle for Lazada
    if (targetUrl.includes('lazada.ph')) {
        return res.json({
            title: "Lazada Product",
            image: "https://logos-world.net/wp-content/uploads/2022/05/Lazada-Logo.png",
            url: `https://ad.involve.asia/track/click?u=${encodeURIComponent(targetUrl)}&pub_id=1076714`
        });
    }

    const apiKey = '9c3d209886ae817c47d9010e44103cee'; 
    const proxyUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render=true`;
    
    const response = await got(proxyUrl, { timeout: 40000 });
    const metadata = await metascraper({ html: response.body, url: response.url });
    
    res.json({
      title: metadata.title || "Gift Item",
      image: metadata.image || "https://via.placeholder.com/150",
      url: targetUrl // This will include your affiliate logic
    });
  } catch (error) {
    res.json({
        title: "Store Item",
        image: "https://via.placeholder.com/150",
        url: req.body.targetUrl
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
