import type { Request, Response } from "express";
import User from "../Models/User"
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../Models/Token";
import { generateSixDigitToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { promises } from "nodemailer/lib/xoauth2";
import { generateJWT } from "../utils/jwt";

export class AuthController {

    static register = async (req: Request, res: Response) => {
        try {
            const {password, email} = req.body;
            
            //Prevenir duplicados
            const userExists = await User.findOne({email})

            if(userExists){
                const error = new Error(`El usuario con correo: ${email} ya esta registrado`)
                return res.status(409).json({error: error.message})
            }

            //Crear usuario
            const user = new User(req.body)

            //Hash password
            user.password = await hashPassword(password);

            //Generar Token
            const token = new Token();
            token.token = generateSixDigitToken();
            token.user = user.id

            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })
            
            await Promise.allSettled([user.save(), token.save()])

            return res.send(`Cuenta creada, revisa tu email: ${req.body.email} para confirmarla`)
        } catch (error) {
            return res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {   
            const {token} = req.body;
            const tokenExists = await Token.findOne({token});
           
            if(!tokenExists){
                const error = new Error('Token no valido')
                return res.status(404).json({error: error.message});
            }
            
            const user = await User.findById(tokenExists.user);
            user.confirmed = true;

            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
            return res.send('Cuenta confirmada correctamente!')
        } catch (error) {
            return  res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async (req: Request, res: Response )  => {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({email});

            if(!user){
                const error = new Error('Usuario no encontrado');
                return res.status(404).json({error: error.message})
            }

            if(!user.confirmed){

                //Generar Token
                const token = new Token();
                token.token = generateSixDigitToken();
                token.user = user.id
                await token.save()

                //Enviar Email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación');
                return res.status(401).json({error: error.message})
            }

            //Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password);

            if(!isPasswordCorrect){
                const error = new Error('Password Incorrecto...');
                return res.status(401).json({error: error.message})
            }

            const token = generateJWT({id: user.id})
            return res.send(token)

        } catch (error) {
            return res.status(500).json({error: 'Hubo un error'})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const {email} = req.body;
            
            //Usuario Existe
            const user = await User.findOne({email})

            if(!user){
                const error = new Error(`El Usuario no esta registrado`)
                return res.status(404).json({error: error.message})
            }

            if(user.confirmed){
                const error = new Error(`El Usuario ya esta confirmado`)
                return res.status(403).json({error: error.message})
            }

            //Generar Token
            const token = new Token();
            token.token = generateSixDigitToken();
            token.user = user.id

            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })
            
            await Promise.allSettled([user.save(), token.save()])

            return res.send(`Se envió un nuevo token a tu e-mail`)
        } catch (error) {
            return res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const {email} = req.body;
            
            //Usuario Existe
            const user = await User.findOne({email})

            if(!user){
                const error = new Error(`El Usuario no esta registrado`)
                return res.status(404).json({error: error.message})
            }

            //Generar Token
            const token = new Token();
            token.token = generateSixDigitToken();
            token.user = user.id
            await token.save();

            //Enviar Email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })
            
            return res.send(`Revisa tu Email para las siguientes instrucciones`)
        } catch (error) {
            return res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {   
            const {token} = req.body;
            const tokenExists = await Token.findOne({token});
           
            if(!tokenExists){
                const error = new Error('Token no valido')
                return res.status(404).json({error: error.message});
            }
            return res.send('Token Válido, Define tu nuevo password')
        } catch (error) {
            return res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {   
            const {token} = req.params;
            const {password} = req.body;
            const tokenExists = await Token.findOne({token});
           
            if(!tokenExists){
                const error = new Error('Token no valido')
                return res.status(404).json({error: error.message});
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password);

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            return res.send('El password se modificó correctamente')
        } catch (error) {
            return res.status(500).json({error: 'Hubo un error'})
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        const {name, email} = req.body;

        const userExist = await User.findOne({email})

        if(userExist && userExist.id.toString() !== req.user.id.toString()){
            const error = new Error('Ese email ya esta registrado.')
            return res.status(401).json({error: error.message})
        }

        try {
            req.user.name = name,
            req.user.email = email,
    
            await req.user.save();
            return res.send('Pefil actualizado correctamente')
        } catch (error) {
            return res.status(500).send('Hubo un error')
        }

    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
            const {current_password, password} = req.body;

            const user = await User.findById(req.user.id);

            const isPasswordCorrect = await checkPassword(current_password, user.password);
            if(!isPasswordCorrect){
                const error = new Error('El Password actual es incorrecto.')
                return res.status(401).json({error: error.message})
            }

            try {
                
            user.password = await hashPassword(password);

            await user.save();
            return res.send('El Password se actualizo correctamente!');

            } catch (error) {
                return res.status(500).send('Hubo un error')                
            }
    }

    static checkPassword = async (req: Request, res: Response) => { 
        const {password} = req.body;

        const user = await User.findById(req.user.id);

        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('El Password actual es incorrecto.')
            return res.status(401).json({error: error.message})
        }

        return res.send('Password Correcto!');
    }


}