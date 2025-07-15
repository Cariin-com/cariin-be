import { Request, Response } from 'express';
import * as userModel from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as jwtHelper from '../helper/jwt';

// Validasi sederhana
function validateRegisterInput({ name, email, phone, password }: { name: string; email: string; phone: string; password: string }) {
    const errors: Record<string, string> = {};
    if (!name || name.length < 3) errors.name = 'Nama minimal 3 karakter';
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Email tidak valid';
    if (!phone || phone.length < 8) errors.phone = 'No HP minimal 8 digit';
    if (!password || password.length < 6) errors.password = 'Password minimal 6 karakter';
    return errors;
}

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;
    const errors = validateRegisterInput({ name, email, phone, password });
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }
    try {
        // Cek email sudah terdaftar
        const existing = await userModel.findUserByEmail(email);
        if (existing) {
            return res.status(400).json({ errors: { email: 'Email sudah terdaftar' } });
        }
        // Simpan user baru
        const user = await userModel.createUser({ name, email, phone, password });
        res.status(201).json({ user });
    } catch (err: any) {
        res.status(500).json({ error: 'Terjadi kesalahan server', detail: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.loginUser(email, password);
        if (!user) return res.status(401).json({ message: 'Email atau password salah' });

        const token = jwtHelper.generateToken({ userId: user.id, email: user.email });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
        });
        res.json({ message: 'Login berhasil', user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (err: any) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
    }
};

export const getUser = (req: Request, res: Response) => {
    res.json({ message: 'User controller works!' });
};
