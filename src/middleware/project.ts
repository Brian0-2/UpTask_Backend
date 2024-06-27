import type {Request, Response, NextFunction} from 'express';
import Project, { IProjec } from '../Models/Project';

//metodo de typescrip que nos permite reescribir el scope global desde este modulo
/**
 * 1-.Accedemos al scope global de los typos en typescript
 * 2-.Accedemos a los Types de Express en este caso un Interface
 * 3-.Accedemos al Type o Interface de Request
 * 4-.Agregamos una nueva propiedad a la Interface de Request añadiendo nuestro type que necesitamos en este caso IProject
 * 5-.Agregamos otro atributo al Interface de Request para tener acceso a el cada vez que lo utilizemos.
 */

declare global {
    namespace Express {
        interface Request {
            project: IProjec
        }
    }
}

export async function projectExists(req : Request, res : Response, next : NextFunction ) {
    try {
        //Accedemos a los parametros de la ruta en _GET
        const {projectId} = req.params;
        //Filtramos si existe el proyecto
        const project = await Project.findById(projectId)

        if (!project) {
            const error = new Error("Proyecto no encontrado...");
            return res.status(404).json({ error: error.message });
          }
        //Asignamos o retornamos el valor de la llave project al Interface de Request si existe
          req.project = project
          next();
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}
