import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

type UserPayload = {
    id : Types.ObjectId
}

export const generateJWT = (payload: UserPayload ) => {

                    //.sing es para generar el JWT
                    //.verify es para verificar el JWT
    const token = jwt.sign(payload,process.env.JWT_SECRET, {
        // expiresIn: '5m' : minutos
        // expiresIn: '30s' : segundos
        expiresIn: '180d' // 180 dias
    })

    return token;
}