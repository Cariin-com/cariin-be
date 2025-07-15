import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your_jwt_secret';

export function generateToken(payload: string | object | Buffer, expiresIn: SignOptions['expiresIn'] = '1d'): string {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload | string | null {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
} 