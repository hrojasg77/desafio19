require('dotenv').config();
const express = require('express')
const session = require('express-session')
const { create } = require('express-handlebars')
const cookieParser = require('cookie-parser')
const cluster = require('cluster')
const axios = require('axios').default;
const mongoose = require('mongoose')


const options = {
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 450000, // Close sockets after 45 minutos of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  };


try {
    mongoose.connect('mongodb://127.0.0.1:27017/productos',options)
    console.log('   -- conexión DB Ok')    
} catch (error) {
    console.log('  --  Error DB de conexión')
}

const productsRouter  = require("./routes/products.routes.js");

const { Server: HttpServer } = require('http')
const { Server: Socket } = require('socket.io')

const routerApi = express.Router()

const minimist = require('minimist')

const compression = require('compression')

const pino = require('pino');
const logConsola = pino()

const autocannon = require('autocannon');

const logWarning = pino('warn.log')
const logError   = pino('error.log')

const args = minimist(process.argv.slice(2))

const mongo = require('connect-mongodb-session')(session);

const PORT = args._[0] || 8080
const MODOINICIOSERVER = args._[1] || 'FORK'

console.log(MODOINICIOSERVER)
console.log(PORT)

const NOMBRECOLECCION = process.env.COLLECTIONMONGO

const numCPUs = require('os').cpus().length

const ContenedorMemoria = require('./daos/DaoMemoria.js')
const ContenedorArchivo = require('./daos/DaoFile.js')
const { Store } = require('express-session')
const { remainder_task } = require('moongose/models/index.js')

const fork = require( 'child_process').fork

const app = express()

app.use(compression()); 

advancedOptions = {useNewUrlParser : true, useUnifiedTopology: true}
//--------------------------------------------
// instancio servidor, socket y api

const httpServer = new HttpServer(app)
const io = new Socket(httpServer)

const productosApi = new ContenedorMemoria()
const mensajesApi = new ContenedorArchivo('mensajes.json')

//--------------------------------------------
// configuro el socket


io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');

    // carga inicial de productos
    socket.emit('productos', productosApi.listarAll());

    // actualizacion de productos
    socket.on('update', producto => {
        try {
        productosApi.guardar(producto)
        io.sockets.emit('productos', productosApi.listarAll());
        } catch(error)
        {
            logError(error)  
        }
    })

    // carga inicial de mensajes
    socket.emit('mensajes', await mensajesApi.listarAll());

    // actualizacion de mensajes
    socket.on('nuevoMensaje', async mensaje => {
        try {
            mensaje.fyh = new Date().toLocaleString()
            await mensajesApi.guardar(mensaje)
            io.sockets.emit('mensajes', await mensajesApi.listarAll());
        } catch(error)
        {
            logError(error)  
        }
    })
});

//--------------------------------------------
// agrego middlewares

const hbs = create({ extname : ".hbs",}) 

app.engine(".hbs",hbs.engine)
app.set('view engine', 'hbs');
app.set("views", "./views");

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())



//--------------------------------------------
// Almacenar la sesion

/*
var store = new mongo({
    uri:  'mongodb://localhost:27017/?readPreference=primary&ssl=false&directConnection=true',
    collection: NOMBRECOLECCION
  });
*/

const url = 'http://localhost/'

app.post('/login',(req, res) =>{
    session.user = req.body.login;

    app.use(require('express-session')({
        secret: 'muysecreta',
        cookie: {
          maxAge: (1000 * 60 * 60) 
        },
        store: store,
        resave: true,
        saveUninitialized: false
      }));
      
    const datos = {nombre : req.body.login}
    res.render('principal',datos)
})


app.post('/logout',(req, res) =>{
    const datos = {nombre : session.user}
    res.render('logout',datos)
})

app.get('/info',(req, res) =>{  

    const animal = 'ElGato';
    res.send(animal.repeat(1000));

    logConsola.info('This is info type log from pino');
    logConsola.warn('This is warn type log from pino');
    logConsola.error('This is error type log from pino');    

    /*
    const memoria = process.memoryUsage()
    const numCPUs = require('os').cpus().length
    const respuesta = 
    'Número de CPUs        : ' + numCPUs + '<br>' +    
    '<br>' +    
    'Argumentos de entrada : ' + process.argv + '<br>' +
    'Sistema Operativo     : ' + process.platform + '<br>' +
    'Versión node.js       : ' + process.version + '<br>' +
    'Memoria reservada rss : ' + memoria['rss']  + '<br>' +
    'Ruta ejecución        : ' + process.execPath + '<br>' +
    'Process ID            : ' + process.ppid  + '<br>' +
    'Carpeta del proyecto  : ' + process.cwd()  + '<br>' 

     res.send( respuesta )
     */
    
})

function controllerCalcula(req,res){
    let limite
    if(!req.query.cant)
    {
        limite = 100000000
    }
    else
    {
        limite = req.query.cant        
    }

    const computo = fork('src/computo.js')
    computo.send({ limite: limite });

    computo.on('message', msg => {
        if (msg === 'listo') {
            
        } 
        else
        {
            res.send(msg)
        }
    })
}

function controllerTodo(req,res){
    logConsola.info('Cualquiera')
}

routerApi.get('/ramdoms',controllerCalcula)

app.all('*',controllerTodo)

app.use('/api',routerApi)
// app.use(express.static('public'))
//--------------------------------------------
// inicio el servidor


    if (MODOINICIOSERVER == 'CLUSTER') {
        if (cluster.isPrimary) {
            console.log(`PID PRIMARIO ${process.pid}`)

            for (let i = 0; i < numCPUs; i++) {
                cluster.fork()
            }

            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died`)
                cluster.fork()
            })
        } else {
            // crearServidor(8000)
            const connectedServer = httpServer.listen(PORT, () => {
                console.log(`Servidor http escuchando en el puerto ${connectedServer.address().port}`)
            })
            connectedServer.on('error', error => console.log(`Error en servidor ${error}`))   
        }
    }
    else
    {
        const connectedServer = httpServer.listen(PORT, () => {
            console.log(`Servidor http escuchando en el puerto ${connectedServer.address().port}`)
        })
        connectedServer.on('error', error => console.log(`Error en servidor ${error}`))   
    }    


    function conectar(puerto) {
        return new Promise((resolve, reject) => {
            server = app.listen(puerto, () => {
                // console.log(`escuchando en ${puerto}`)
                resolve(true)
            })
        })
    }
    
    function desconectar(puerto) {
        return new Promise((resolve, reject) => {
            server.close(err => {
                // console.log(`desconectado!`)
                resolve(true)
            })
        })
    }    

    module.exports = conectar, desconectar 

