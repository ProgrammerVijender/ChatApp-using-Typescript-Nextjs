import type { Request, Response, NextFunction , RequestHandler } from 'express';

const TryCatch = (handler: RequestHandler) : RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // console.log('before----')
            await handler(req, res, next);
            // console.log('after----')
            
        } catch (error) {
            // next(error);
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    };
}

export default TryCatch;
// import type { Request, Response, NextFunction, RequestHandler } from "express";

// const TryCatch = (handler: RequestHandler): RequestHandler => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await handler(req, res, next);
//     } catch (error) {
//       // 🔴 IMPORTANT: log full error in terminal
//       console.error("❌ API ERROR:", error);

//       // ✅ Send readable error to client
//       if (error instanceof Error) {
//         return res.status(500).json({
//           message: error.message,
//         });
//       }

//       return res.status(500).json({
//         message: "Internal Server Error",
//       });
//     }
//   };
// };

// export default TryCatch;