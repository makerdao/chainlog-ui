// server.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        const config = {
            IPFS_CID: "${process.env.IPFS_CID}",
            INFURA_API_KEY: "${process.env.INFURA_API_KEY}",
            ETHERSCAN_API_KEY: "${process.env.ETHERSCAN_API_KEY}"
        };
    `);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
