const Router = require("express");
const registerProduct = require("../controllers/products.controller.js")
const listProducts = require("../controllers/products.controller.js")
const getProduct = require("../controllers/products.controller.js")
const updateProduct = require("../controllers/products.controller.js")
const deleteProduct  = require("../controllers/products.controller.js")

const router = Router()

router.post('/api/products', registerProduct)
router.get('/api/products', listProducts)
router.get('/api/products/:id',getProduct)
router.put('/api/products',updateProduct)
router.delete('/api/products/:id',deleteProduct)

module.exports = router