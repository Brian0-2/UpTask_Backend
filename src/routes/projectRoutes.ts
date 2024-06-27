import { Router } from "express";
import { body, param } from 'express-validator'
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

//Proteger todos los endpoints
router.use(authenticate)

router.post('/', 
    body('projectName').notEmpty().withMessage('El nombre del proyecto es requerido'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es requerido'),
    body('description').notEmpty().withMessage('La descripcion del proyecto es requerida'),
    handleInputErrors,
    ProjectController.createProject
);

router.get('/', ProjectController.getAllProjects);

router.get('/:id', 
    param('id').isMongoId().withMessage('Id no válido'),    
    handleInputErrors,
    ProjectController.getProjectById
);

/**Routes for tasks */
//Validar en las siguientes rutas que el projectId exista, es para no colocarlo en cada funcion

router.param('projectId', projectExists)
router.put('/:projectId', 
    param('projectId').isMongoId().withMessage('Id no válido'),
    body('projectName').notEmpty().withMessage('El nombre del proyecto es requerido'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es requerido'),
    body('description').notEmpty().withMessage('La descripción del proyecto es requerida'),    
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
);

router.delete('/:projectId', 
    param('projectId').isMongoId().withMessage('Id no válido'),    
    handleInputErrors,
    ProjectController.deleteProject
);



//Este tipo de enrutamiento se le conoce como : Nested Resource Routing o Enrutamiento de Recursos Anidados
router.post('/:projectId/tasks',
    param('projectId').isMongoId().withMessage('Id no válido'),    
    body('name').notEmpty().withMessage('El nombre de la tarea es requerido'),
    body('description').notEmpty().withMessage('La descripción de la tarea es requerida'),
    handleInputErrors,
    hasAuthorization,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    param('projectId').isMongoId().withMessage('Id no válido'),   
    handleInputErrors,
    TaskController.getProjectTasks
)

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
    param('projectId').isMongoId().withMessage('Id del proyecto no válido'),   
    param('taskId').isMongoId().withMessage('Id de la tarea no válido'),   
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Id del proyecto no válido'),   
    param('taskId').isMongoId().withMessage('Id de la tarea no válido'),
    body('name').notEmpty().withMessage('El nombre de la tarea es requerido'),
    body('description').notEmpty().withMessage('La descripción de la tarea es requerida'),   
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Id del proyecto no válido'),   
    param('taskId').isMongoId().withMessage('Id de la tarea no válido'),   
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('projectId').isMongoId().withMessage('Id del proyecto no válido'),   
    param('taskId').isMongoId().withMessage('Id de la tarea no válido'),  
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

/** Routes for teams */

router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('Email no válido'),
    handleInputErrors,
    TeamController.findMemberById
)

router.get('/:projectId/team',
    TeamController.getProyectTeam
)

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('ID No Válido'),
    handleInputErrors,
    TeamController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('ID No Válido'),
    handleInputErrors,
    TeamController.removeMemberById
)

/** Routes for Notes */

router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es requerido'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID No Válido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router;