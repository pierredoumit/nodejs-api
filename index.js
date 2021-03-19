const express = require('express');
const connectDB = require('./config/db')
const app = express();

//connect db
connectDB();

//init middleware
app.use(express.json({ extended: false }))

//define routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/product', require('./routes/api/product'))
app.use('/api/order', require('./routes/api/order'))
app.use('/api/category', require('./routes/api/category'))
app.use('/api/auth', require('./routes/api/auth'))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
