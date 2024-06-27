import {CorsOptions} from 'cors'

export const corsConfig: CorsOptions = {
    //origin es la url de react
    //callback es lo que va a permitir la peticion
    origin: function(origin, callback) {

        //este codigo me imprime un vector como el siguiente el cual solo puedo acceder a --api 
        // si arranco el servidor con npm run dev:api el cual esta configurado en package.json
        // console.log(process.argv);
        // [
        //     'C:\\Users\\ingbv\\Escritorio\\UpTask_MERN\\uptask_backend\\node_modules\\ts-node\\dist\\bin.js',
        //     'C:\\Users\\ingbv\\Escritorio\\UpTask_MERN\\uptask_backend\\src\\index.ts',
            //Permitir este api en PostMan
        //     '--api'
        //   ]

        const whitelist = [process.env.FRONTEND_URL]

        //Si en el vector del arranque con npm run dev:api existe en el arreglo ['--api'] en la posicion 3, metelo a la lista blanca
        if(process.argv[2] === '--api'){
            whitelist.push(undefined)
        }

        if(whitelist.includes(origin)) {
        //Primer parametro es un error y un true que si queremos permitir la conexion
            callback(null, true)
        }else {
            callback(new Error('Error de CORS'))
        }
    }
}