import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post('/register', 
    body('name').notEmpty().withMessage('El nombre es requerido'),    
    body('password').isLength({min: 8}).withMessage('El password requiere 8 caracteres').notEmpty().withMessage('El password es requerido'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Los Password no son iguales')
        }
        return true;
    }),
    body('email').isEmail().withMessage('El Email no es valido').notEmpty().withMessage('El email es requerido'),
    handleInputErrors,
    AuthController.register
);

router.post('/confirm-account',
    body('token').notEmpty().withMessage('El token es requerido'),   
    handleInputErrors, 
    AuthController.confirmAccount
);

router.post('/login',
    body('email').isEmail().withMessage('El Email no es valido').notEmpty().withMessage('El email es requerido'),  
    body('password').notEmpty().withMessage('El password es requerido'),
    handleInputErrors, 
    AuthController.login
);

router.post('/request-code',
    body('email').isEmail().withMessage('El Email no es valido').notEmpty().withMessage('El email es requerido'),
    handleInputErrors, 
    AuthController.requestConfirmationCode
);

router.post('/forgot-password',
    body('email').isEmail().withMessage('El Email no es valido').notEmpty().withMessage('El email es requerido'),
    handleInputErrors, 
    AuthController.forgotPassword
);

router.post('/validate-token', 
    body('token').notEmpty().withMessage('El token es requerido'),   
    handleInputErrors, 
    AuthController.validateToken
);

router.post('/update-password/:token', 
    param('token').isNumeric().withMessage('Token no válido'),
    body('password').isLength({min: 8}).withMessage('El password requiere 8 caracteres').notEmpty().withMessage('El password es requerido'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Los Password no son iguales')
        }
        return true;
    }),
    handleInputErrors, 
    AuthController.updatePasswordWithToken
);

router.get('/user', 
    authenticate, 
    AuthController.user
);

/** Profile */

router.put('/profile',
    authenticate,
    body('name').notEmpty().withMessage('El nombre es requerido'),    
    body('email').isEmail().withMessage('El Email no es valido').notEmpty().withMessage('El email es requerido'),
    handleInputErrors,
    AuthController.updateProfile
)

router.post('/update-password',
    authenticate,
    body('current_password').notEmpty().withMessage('El password actual es requerido'),    
    body('password').isLength({min: 8}).withMessage('El password requiere 8 caracteres').notEmpty().withMessage('El password es requerido'),
    body('password_confirmation').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Los Password no son iguales')
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password').notEmpty().withMessage('El password es requerido'), 
    handleInputErrors,
    AuthController.checkPassword
)

export default router;