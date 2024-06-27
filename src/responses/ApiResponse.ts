// import type { Response } from "express";

// type ApiResponseProps = {
//     res: Response,
//     message: String,
//     statusCode: number,
//     data: object
// }

// export class ApiResponse {

//     static success({ res, message = 'Success', statusCode, data = {} }: ApiResponseProps) {
//         return res.status(statusCode).json({
//             message,
//             statusCode,
//             error: false,
//             data
//         });
//     }

//     static error({ res, message = 'Error', statusCode, data = {} }: ApiResponseProps) {
//         return res.status(statusCode).json({
//             message,
//             statusCode,
//             error: true,
//             data
//         });
//     }
// }