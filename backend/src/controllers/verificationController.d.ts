import type { Request, Response } from 'express';
export declare const sendVerificationCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const checkCode: (phone: string) => boolean;
//# sourceMappingURL=verificationController.d.ts.map