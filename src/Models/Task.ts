import mongoose, {Schema,Document, Types} from "mongoose";
import Note from "./Note";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IND_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const

//Esta sintaxis ase referencia a : type taskStatus = "pending" | "onHold" | "inprogress" | "underReview" | "completed"
export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

export interface ITask extends Document {
    name: string,
    description: string,
    project: Types.ObjectId,
    status: TaskStatus,
    completedBy: {
        user: Types.ObjectId,
        status: TaskStatus
    }[],
    notes: Types.ObjectId[]
}

export const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
}, {timestamps: true});

// Middleware de Mongoose
TaskSchema.pre('deleteOne', {document: true}, async function(){
    //Obtener el id de las tareas
    const taskId = this._id;

    //si no existe la tarea simplemente retorna
    if(!taskId) return 

    //Si existe el id de la tarea en las notas borra todas
    await Note.deleteMany({task: taskId})
    
})

const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task;

