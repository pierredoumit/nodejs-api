const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const uploader = require('../../middleware/upload');

// Load Input Validation
const validateProduct = require('../../validation/product');
// Load Product model
const Product = require('../../models/Product');


// @route   GET api/product
// @desc    get all products
// @access  Public
router.get('/', auth, async (req, res) => {
    try {

        let cat_filter = req.query.category;
        let price_indicator = req.query.price_indicator;
        let price_filter = null;

        if (price_indicator === "greater")
            price_filter = { $gte: parseFloat(req.query.price) }
        else if (price_indicator === "less")
            price_filter = { $lte: parseFloat(req.query.price) }

        let query = {};

        if (cat_filter !== undefined)
            query.category = cat_filter;

        if (price_filter !== null)
            query.price = price_filter;

        const product = await Product.find(query);

        if (product.length === 0) {
            return res.status(400).json({ msg: 'No products found' });
        }

        res.json(product)
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error")
    }
});


// @route   GET api/product/:product_id
// @desc    get product by id
// @access  Public
router.get('/:product_id', auth, async (req, res) => {
    try {
        const product = await Product.findById({ _id: req.params.product_id });

        if (!product) {
            return res.status(400).json({ msg: 'No product found' });
        }

        res.json(product)
    }
    catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId')
            return res.status(400).json({ msg: 'No product found' });

        res.status(500).send("Server Error")
    }
});

// @route   Post api/category
// @desc    Create or Update category
// @access  Admin
router.post('/', auth, async (req, res) => {
    const { errors, isValid } = validateProduct(req.body);

    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }
    if (req.user.access === "User")
        return res.status(400).json({ msg: "You do not have access to modify products" });

    const { name, id, price, category, imageURL } = req.body;
    let product;
    let image = '';

    if (imageURL !== undefined) {
        image = Date.now() + ".png";
        await uploader(imageURL, "./uploads/" + image, () => {
            console.log("Image Uploaded")
        })
    }

    if (id === undefined) { // create
        product = new Product({
            name,
            price,
            category,
            image
        })
    }
    else { // modify
        product = await Product.findById({ _id: id })
        product.name = name;
        product.price = price;
        product.image = image;
    }
    await product.save();
    res.send(product)
});



// @route   Delete api/product
// @desc    Delete product
// @access  Admin
router.delete('/', auth, async (req, res) => {

    if (req.user.access === "User")
        return res.status(400).json({ msg: "You do not have access to modify products" });

    await Product.findOneAndRemove({ _id: req.body.id });

    res.json({ msg: "Product Deleted" })
});


module.exports = router;