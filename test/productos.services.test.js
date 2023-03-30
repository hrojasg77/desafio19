const axios = require('axios')
const assert = require('chai').assert
const desconectar = require('../main.js')
const conectar = require('../main.js')
const productsRouter  = require("../routes/products.routes.js");

axios.defaults.baseURL = `http://localhost:8080`;

describe('TestPrincipales', () => {
    // antes de TODAS las pruebas
    before(async () => {
        await conectar(8080)
    })

    // dsp de TODAS las pruebas
    after(async () => {
        await desconectar()
    })

    describe('Productos',()=>{
        it('Creacion de producto' , async ()=>{
            const name = 'DAC TempoTec HD'
            const description = 'Para mejorar sonido'
            const price = 95000
            const image = 'http://imagenes'

            const { data, status } = await axios.post('/api/products', {
                name, price, description, image
              });

              ID = data.id;

              if (!data.id) throw new Error('Error al crear el producto no tiene ID');              
              if (!data) throw new Error('No se creó el producto');
              if (status !== 201) throw new Error('Estado no es 201');
              if (!data.name) throw new Error('El nombre tiene un falta o tiene un problema');
              if (data.name !== name) throw new Error('El nombre creado no es el mismo que el nombre enviado ');
              if (typeof data.thumbnail !== 'string') throw new Error('El thumbnail del producto no es string');
        } )
    })
})