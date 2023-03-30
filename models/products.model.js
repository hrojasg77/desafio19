const model = require("mongoose");
const {Schema} = model

const productsSchema = new Schema({
    id: { type: String, trim: true },
    name : { type: String},
    description: { type:  String },
    price : { type:  Number },
    image: { type:  String }
})

//ProductsModel = model.model('productsSchema',productsSchema) 
// module.exports = ProductsModel;

module.exports = model.model('productsSchema',productsSchema) 