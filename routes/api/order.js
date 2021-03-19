const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

// Load Product model
const Order = require('../../models/Order');


// @route   GET api/order
// @desc    get all orders
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.access === "User") // to only be able to see own orders if User
            query.user = req.user.id

        const order = await Order.find(query);
        if (order.length === 0) {
            return res.status(400).json({ msg: 'No orders found' });
        }
        res.json(order)
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error")
    }
});


// @route   GET api/order/:order_id
// @desc    get order by id
// @access  Public
router.get('/:order_id', auth, async (req, res) => {
    try {
        const order = await Order.findById({ _id: req.params.order_id });

        if (!order) {
            return res.status(400).json({ msg: 'No order found' });
        }

        if (order.user.toString() !== req.user.id && req.user.access === "User")
            return res.status(400).json({ msg: 'Order does not belong to you' });

        res.json(order)
    }
    catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId')
            return res.status(400).json({ msg: 'No order found' });

        res.status(500).send("Server Error")
    }
});

// @route   Post api/order
// @desc    submit order
// @access  Public
router.post('/', auth, async (req, res) => {

    const { cart } = req.body;
    const user = req.user.id;
    const user_name = req.user.name;

    const total = cart.reduce((r, d) => r + d.price, 0);

    let order = new Order({
        cart,
        user,
        total,
        user_name
    })

    await order.save();
    res.send(order)
});



module.exports = router;