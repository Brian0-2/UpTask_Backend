import type { Request, Response } from "express";
import Project from "../Models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    //Asignar un manager
    // req.user biene del middleware autenticate
    project.manager = req.user.id;

    try {
      //Forma corta
      // await Project.create(req.body)
      await project.save();

      return res.send("Proyecto creado correctamente!");
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or : [
          //Filtrar el proyecto si eres el que lo creo o si eres parte de el
          {manager: {$in: req.user.id}},
          {team: {$in: req.user.id}}
        ]
      });
      return res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      //Traeme el proyecto donde el projectId = id junto con la informacion de las tareas con populate.tasks
      const project = await Project.findById(id).populate('tasks');

      if (!project) {
        const error = new Error("Proyecto no encontrado...");
        return res.status(404).json({ error: error.message });
      }
                                                //si en un proyecto en especifico no eres parte de el
      if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){
        const error = new Error("Accion no valida...");
        return res.status(404).json({ error: error.message });
      }

      return res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {

    try {

      req.project.clientName = req.body.clientName
      req.project.projectName = req.body.projectName
      req.project.description = req.body.description

      await req.project.save();
      return res.send("Proyecto Actualizado!");
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {

    try {
      await req.project.deleteOne();
      return res.send("Proyecto Eliminado!");
    } catch (error) {
      console.log(error);
    }
  };
}
