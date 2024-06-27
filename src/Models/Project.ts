import mongoose, {Schema,Document, PopulatedDoc, Types} from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

export interface IProjec extends Document {
    projectName: string,
    clientName: string,
    description: string,
    //task lleva [] porque puede tener muchas tareas
    tasks: PopulatedDoc<ITask & Document>[],
    //manager no lleva [] porque solamente pertenece a un gerente que cree el proyecto
    manager: PopulatedDoc<IUser & Document>,
    team: PopulatedDoc<IUser & Document>[]

}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager : {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
}, {timestamps: true});

// Middleware de Mongoose
ProjectSchema.pre('deleteOne', {document: true}, async function(){
    //Obtener el id del proyecto
    const projectId = this._id;

    //si no existe el proyecto simplemente retorna
    if(!projectId) return 

    //Traerme todas las tareas
    const tasks = await Task.find({project: projectId})
    for(const task of tasks){
        await Note.deleteMany({task: task.id})
    }

    //Si existe el id de la tarea en las tareas borra todas
    await Task.deleteMany({project: projectId})
    
})

const Project = mongoose.model<IProjec>('Project', ProjectSchema)
export default Project;