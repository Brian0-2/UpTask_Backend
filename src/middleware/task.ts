import type {Request, Response, NextFunction} from 'express';
import Task, { ITask } from '../Models/Task';

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
            task: ITask
        }
    }
}

export async function taskExists(req : Request, res : Response, next : NextFunction ) {
    try {
        //Accedemos a los parametros de la ruta en _GET
        const {taskId} = req.params;
        //Filtramos si existe el proyecto
        const task = await Task.findById(taskId)

        if (!task) {
            const error = new Error("Tarea no encontrada...");
            return res.status(404).json({ error: error.message });
          }
        //Asignamos o retornamos el valor de la llave task al Interface de Request si existe
          req.task = task
          next();
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export function taskBelongsToProject(req : Request, res : Response, next : NextFunction) {
    //Verificar que la tarea pertenesca al mismo proyecto
    if(req.task.project.toString() !== req.project.id.toString()){
        const error = new Error("Esta tarea no pertenece al proyecto...");
        return res.status(400).json({ error: error.message });
    }
    next()
}

export function hasAuthorization(req : Request, res : Response, next : NextFunction) {
    //Verificar que la tarea pertenesca al mismo proyecto
    if(req.user.id.toString() !== req.project.manager.toString()){
        const error = new Error("Accion no válida...");
        return res.status(400).json({ error: error.message });
    }
    next()
}