require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/compare", async (req, res) => {

    const { query } = req.body;

    if (!query) {
        return res.status(400).json({
            error: "Missing search query"
        });
    }

    try {

        const url =
            `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&gl=in&hl=en&api_key=${process.env.SERPAPI_KEY}`;

        const response = await fetch(url);

        const data = await response.json();

        console.log("========== SERPAPI RESPONSE ==========");
        console.log(JSON.stringify(data, null, 2));
        console.log("======================================");

        if (!data.shopping_results) {
            return res.json([]);
        }

        const stores = [
            "Amazon",
            "Flipkart",
            "Croma",
            "Reliance Digital",
            "Myntra"
        ];

        const colors = {
            Amazon: "#FF9900",
            Flipkart: "#2874F0",
            Myntra: "#FF3F6C",
            Croma: "#00A6E0",
            "Reliance Digital": "#E4002B"
        };

        const results = [];

        stores.forEach(store => {

            const item = data.shopping_results.find(result =>
                result.source &&
                result.source.toLowerCase().includes(store.toLowerCase())
            );

            if (item) {

                results.push({

                    name: store,

                    sub: item.source,

                    color: colors[store],

                    letter: store[0],

                    price:
                        item.extracted_price ??
                        Number(
                            (item.price || "0")
                                .replace(/[^\d.]/g, "")
                        )
                });

            }

        });

        res.json(results);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Server error"
        });

    }

});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Price Comparison API is running 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});