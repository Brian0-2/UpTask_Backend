import type { Request, Response } from "express"
import User from "../Models/User";
import Project from "../Models/Project";

export class TeamController {

    static findMemberById = async (req: Request, res: Response) => {
        const {email} = req.body;

        //Find User
        const user = await User.findOne({email}).select('_id email name');

        if(!user){
            const error = new Error('Usuario No Encontrado');
            return res.status(404).json({error: error.message})
        }
            
        return res.json(user)
    }
    
    static getProyectTeam = async (req: Request, res: Response) => {

        //Traeme todos los usaurios que pertenescan a un proyecto
        const project = await Project.findById(req.project.id).populate({ 
            //traeme todos los datos solo de team del proyecto filtrado
            path: 'team',
            //solo traeme estos campos de team
            select: '_id email name'
        });
        
        return res.json(project.team)
    }

    static addMemberById = async (req: Request, res: Response) => {
        const { id } = req.body;

        //Find User
        const user = await User.findById(id).select('_id');

        if(!user){
            const error = new Error('Usuario No Encontrado');
            return res.status(404).json({error: error.message})
        }

        //Si el usaurio ya existe que no lo agrege
        if(req.project.team.some(team => team.toString() === user.id.toString())){
            const error = new Error('El Usuario Ya existe en el Proyecto');
            return res.status(409).json({error : error.message})
        }

        req.project.team.push(user.id);
        await req.project.save();

        return res.send('Usuario Agregado Correctamente')
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const { userId } = req.params;

        //Si el id del usaurio no existe en el proyecto
        if(!req.project.team.some(team => team.toString() === userId)){
            const error = new Error('El Usuario No Existe en el proyecto');
            return res.status(409).json({error : error.message})
        }

        //Eliminar el usaurio
        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId)
        await req.project.save();

        return res.send('Usuario Eliminado Correctamente')
    }

}