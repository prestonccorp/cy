const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth");
const Order = require("../models/order");
const { Product } = require("../models/product");
const User = require("../models/user");
const app = express();
const stripe = require('stripe')('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')



userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.equals(product._id)) {
          isProductFound = true;
        }
      }

      if (isProductFound) {
        let producttt = user.cart.find((productt) =>
          productt.product._id.equals(product._id)
        );
        producttt.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.post("/api/add-to-cart2", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);
    let isProductFound = false;
    if (user.cart2.length == 0) {
      user.cart2.push({ product, quantity: 1 });
    } 
    else if(user.cart2.length == 1 && user.cart2[0].product._id.equals(product._id) == false){

      user.cart2.pop();
      user.cart2.push({ product, quantity: 1 });
    }

    else if (user.cart2.length == 1 && user.cart2[0].product._id.equals(product._id)) {
      isProductFound = true;

      if (isProductFound) {
        let producttt = user.cart2.find((productt) =>
          productt.product._id.equals(product._id)
        );
        producttt.quantity += 1;
      }
    }
  


    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          user.cart[i].quantity -= 1;
        }
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.delete("/api/remove-from-cart2/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);
    let isProductFound = false;
    if (user.cart2.length == 1 && user.cart2[0].product._id.equals(product._id)) {
      isProductFound = true;
      if (isProductFound) {
        let producttt = user.cart2.find((productt) =>
          productt.product._id.equals(product._id)
        );
        producttt.quantity -= 1;
      }
    }
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// save user address
userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);
    user.address = address;
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.post("/api/save-user-cc", auth, async (req, res) => {
  try {
    const { cc } = req.body;
    let user = await User.findById(req.user);
    user.cc = cc;
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// order product
userRouter.post("/api/order", auth, async (req, res) => {
  try {



    const { cart, totalPrice, address } = req.body;
    let products = [];

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Order Entailment',
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://thefineline.000webhostapp.com/',
      cancel_url: 'https://thefineline.000webhostapp.com/',
    });
  
    res.send({ url: session.url});

    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await product.save();
      } else {
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock!` });
      }
    }

    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();

    let order = new Order({
      products,
      totalPrice,
      address,
      userId: req.user,
      orderedAt: new Date().getTime(),
    });
    order = await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.post("/api/order2", auth, async (req, res) => {
  try {
    const { cart2, totalPrice, address } = req.body;
    let products = [];

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Order Entailment',
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:62554/#/',
      cancel_url: 'http://localhost:62554/#/',
    });
  
    res.send({ url: session.url});


    for (let i = 0; i < 1; i++) {
      let product = await Product.findById(cart2[i].product._id);
      if (product.quantity >= cart2[i].quantity) {
        product.quantity -= cart2[i].quantity;
        products.push({ product, quantity: cart2[i].quantity });
        await product.save();
      } else {
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock!` });
      }
    }

    let user = await User.findById(req.user);
    user.cart2 = [];
    user = await user.save();

    let order = new Order({
      products,
      totalPrice,
      address,
      userId: req.user,
      orderedAt: new Date().getTime(),
    });
    order = await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.get("/api/orders/me", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = userRouter;
