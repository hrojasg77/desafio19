const ProductsModel = require("../../models/products.model.js");
const  ObjectId  = require("mongodb");

module.exports = registerProduct = async (req,res) => {
    const {name, description, price, image} = req.body
    
    try {
            const NewProduct = new ProductsModel({name, description, price, image});
            await NewProduct.save()
            return res.status(200).json({ ok: 'Producto Insertado' })  
    } catch (error) {
        console.log(error) 
        return res.status(403).json({ error: 'Error al insertar producto' })          
     }
}

module.exports = listProducts = async (req,res) => {
    try {
            const listado = await ProductsModel.find()
            return res.status(200).send(listado)
    } catch (error) {
        console.log(error) 
        return res.status(403).json({ error: 'Error al listar productos' })          
     }
}

module.exports = getProduct = async ({ body, params },res) => {
    const id = params.id
    try {
            const product = await ProductsModel.findById(id)
            if(!product) return res.status(403).json({ error: 'No existe el producto registrado en la DB' })     
            return res.status(200).send(product)
    } catch (error) {
        console.log(error) 
        return res.status(403).json({ error: 'Error al buscar producto' })          
     }
}

module.exports = updateProduct = async (req,res) => {
    const {id, name, description, price, image} = req.body
    try {
            const product = await ProductsModel.updateOne({_id: id},{ $set: {name: name, description: description, price: price, image: image} })
            if(!product) return res.status(403).json({ error: 'No existe el producto registrado en la DB' })     
            return res.status(200).send(product)
    } catch (error) {
        console.log(error) 
        return res.status(403).json({ error: 'Error al buscar producto' })          
     }
}

module.exports = deleteProduct = async ({ body, params },res) => {
    const id = params.id
    try {
            await ProductsModel.deleteOne({_id: id})
    } catch (error) {
        console.log(error) 
        return res.status(403).json({ error: 'Error al borrar el producto' })          
     }
}

