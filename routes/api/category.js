const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const uploader = require('../../middleware/upload');

// Load Input Validation
const validateCategory = require('../../validation/category');
// Load Category model
const Category = require('../../models/Category');

// @route   GET api/category
// @desc    get all categories
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const category = await Category.find();

        if (category.length === 0) {
            return res.status(400).json({ msg: 'No categories found' });
        }

        res.json(category)
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error")
    }
});


// @route   GET api/category/:category_id
// @desc    get category by id
// @access  Public
router.get('/:category_id', auth, async (req, res) => {
    try {
        const category = await Category.findById({ _id: req.params.category_id });

        if (!category) {
            return res.status(400).json({ msg: 'No category found' });
        }

        res.json(category)
    }
    catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId')
            return res.status(400).json({ msg: 'No category found' });

        res.status(500).send("Server Error")
    }
});

// @route   Post api/category
// @desc    Create or Update category
// @access  Admin
router.post('/', auth, async (req, res) => {
    const { errors, isValid } = validateCategory(req.body);

    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }
    if (req.user.access === "User")
        return res.status(400).json({ msg: "You do not have access to modify categories" });

    const { name, id, imageURL } = req.body;
    let category;
    let image = '';

    if (imageURL !== undefined) {
        image = Date.now() + ".png";
        await uploader(imageURL, "./uploads/" + image, () => {
            console.log("Image Uploaded")
        })
    }

    if (id === undefined) { // create
        category = new Category({
            name,
            image
        })
    }
    else { // modify
        category = await Category.findById({ _id: id })
        category.name = name;
        category.image = image;
    }



    await category.save();
    res.send(category)
});



// @route   Delete api/category
// @desc    Delete category
// @access  Admin
router.delete('/', auth, async (req, res) => {

    if (req.user.access === "User")
        return res.status(400).json({ msg: "You do not have access to modify categories" });

    await Category.findOneAndRemove({ _id: req.body.id });

    res.json({ msg: "Category Deleted" })
});


module.exports = router;