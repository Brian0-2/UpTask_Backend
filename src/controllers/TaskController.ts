import { json, request, type Request, type Response } from 'express';
import Task from '../Models/Task';

export class TaskController {

    static createTask = async (req: Request, res : Response) => {
        // req.project proviene del middleware project el cual accedemos a la interface Request y asignamos el project
        try {
           const task = new Task(req.body)
           task.project = req.project.id
           req.project.tasks.push(task.id)

           //Arreglo de promesas cuando se quiere que se guarden los 2 juntos
           await Promise.allSettled([task.save(),req.project.save()])
           return res.send('Tarea creada Correctamente!')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectTasks = async (req: Request, res : Response) => {
        try {
            //Traeme todas las tareas donde el proyecto = Request.project.id, junto con la informacion el proyecto
            const tasks = await Task.find({project: req.project.id}).populate('project')
            return res.json(tasks);
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTaskById =  async (req: Request, res : Response) => {
        try {

            /**Estos valores son diferentes para tener a consideracion al moemento de evaluar
            * console.log(task.project) =  new ObjectId('665f6ee1fe410a62e0530419')
            *   
            * console.log(req.project.id) = "665f6ee1fe410a62e0530419"
            **/ 

            const task = await Task.findById(req.task.id).populate({
                path: 'completedBy.user',
                select: 'id name email'
            })
            .populate({path: 'notes', populate: {path: 'createdBy', select: 'id name email'}})

            return res.json(task);
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask =  async (req: Request, res : Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save();

            return res.json('Tarea Actualizada Correctamente!');
        } catch (error) {
            res.status(500).json({error: 'Hubo un error xd'})
        }
    }

    static deleteTask =  async (req: Request, res : Response) => {
        try {
            // filtra todas las tareas en el projecto que no sean iguales a la tarea del req.taskId 
            // req.project.tasks = a la tarea de el request en este caso taskId
            req.project.tasks = req.project.tasks.filter( task => task.toString() !== req.task.id.toString())
            // se retorna la tarea task y despues se elimina

            await Promise.allSettled([req.task.deleteOne(),req.project.save()])
            return res.json('Tarea Eliminada Correctamente!');
            
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static updateStatus =  async (req: Request, res : Response) => {
        try {
            //Estado a modificar
            const {status} =  req.body;
            req.task.status = status;

            const data = {
                user: req.user.id,
                status: status
            }

            req.task.completedBy.push(data);
            

            await req.task.save();
            return res.send('Tarea Actualizada Correctamente!');
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'}); 
        }
    }
}