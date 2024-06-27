import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import User, { IUser } from "../Models/User";

//metodo de typescrip que nos permite reescribir el scope global desde este modulo
/**
 * 1-.Accedemos al scope global de los typos en typescript
 * 2-.Accedemos a los Types de Express en este caso un Interface
 * 3-.Accedemos al Type o Interface de Request
 * 4-.Agregamos una nueva propiedad a la Interface de Request añadiendo nuestro type que necesitamos en este caso IUser
 * 5-.Agregamos otro atributo al Interface de Request para tener acceso a el cada vez que lo utilizemos.
 */

declare global {
    namespace Express {
        interface Request {
            user? : IUser
        }
    }
}

export const authenticate =  async (req : Request, res: Response, next : NextFunction) => {
    const bearer = req.headers.authorization

    if(!bearer){
        const error = new Error('No Autorizado');
        return res.status(401).json({error: error.message})
    }

    // const token = bearer.split(' ')[1] una manera de entrar a bearer token
    // Array destructuring
    // biene de esta manera el Bearer: "Bearer token"
    // console.log(bearer);
    
    //Obtener solo el token
    const [,token] = bearer.split(' '); 

    try {
        //IMPORTANTE
        //El jwt tiene que verificarse con la misma palabra clave con la cual lo firmas o lo creas
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verifica que el token decodificado es un objeto y contiene la propiedad id
        if(typeof decoded === 'object' && decoded.id){
            //Solo obtener del usaurio _id , nombre y e-mail en el request
            const user = await User.findById(decoded.id).select('_id name email');

            if(user){
                // Hacer accesible o disponible los usuarios en los Request de Express
                // Ahora se puede utilizar en los controlladores y demas donde agamos request
                req.user = user;
                next()
            }else{
                //No damos informacion si el usaurio existe o no simplemente que el token ya no es valido porque no pertenece a ningun usuario
               return res.status(500).json({error: 'Token No Válido'});
            }
        }
    } catch (error) {
        return res.status(500).json({error: 'Token No Válido'});
    }
}