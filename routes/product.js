const express = require("express");
const productRouter = express.Router();
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");

productRouter.get("/api/products/", async (req, res) => {
  try {
    const page = req.query.p || 0
    const products = await Product.find({ category: req.query.category })
    .skip(page * 20)
    .limit(20);
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// create a get request to search products and get them
// /api/products/search/i
productRouter.get("/api/products/search/:name", async (req, res) => {
  try {
    const products = await Product.find({
      name: { $regex: req.params.name, $options: "i" },
    });

    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// create a post request route to rate the product.
productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, rating, n, des } = req.body;
    let product = await Product.findById(id);

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }

    const ratingSchema = {
      userId: req.user,
      rating,
      n,
      des,
    };

    product.ratings.push(ratingSchema);
    product = await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

productRouter.get("/api/deal-of-day", async (req, res) => {
  try {
    let products = await Product.find({});



    res.json(products[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


productRouter.get("/api/deal", async (req, res) => {
  try {
    const page = req.query.p || 0
    let products = await Product.find()
    .skip(page * 20)
    .limit(20);
    res.json(products);



  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = productRouter;
