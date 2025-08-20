"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.login = exports.registerUser = void 0;
const userModel = __importStar(require("../models/userModel"));
const jwtHelper = __importStar(require("../helper/jwt"));
// Validasi sederhana
function validateRegisterInput({ name, email, phone, password }) {
    const errors = {};
    if (!name || name.length < 3)
        errors.name = 'Nama minimal 3 karakter';
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
        errors.email = 'Email tidak valid';
    if (!phone || phone.length < 8)
        errors.phone = 'No HP minimal 8 digit';
    if (!password || password.length < 6)
        errors.password = 'Password minimal 6 karakter';
    return errors;
}
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, password } = req.body;
    const errors = validateRegisterInput({ name, email, phone, password });
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }
    try {
        // Cek email sudah terdaftar
        const existing = yield userModel.findUserByEmail(email);
        if (existing) {
            return res.status(400).json({ errors: { email: 'Email sudah terdaftar' } });
        }
        // Simpan user baru
        const user = yield userModel.createUser({ name, email, phone, password });
        res.status(201).json({ user });
    }
    catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server', detail: err.message });
    }
});
exports.registerUser = registerUser;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userModel.loginUser(email, password);
        if (!user)
            return res.status(401).json({ message: 'Email atau password salah' });
        const token = jwtHelper.generateToken({ userId: user.id, email: user.email });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
        });
        res.json({ message: 'Login berhasil', user: { id: user.id, email: user.email, name: user.name }, token });
    }
    catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
    }
});
exports.login = login;
const getUser = (req, res) => {
    res.json({ message: 'User controller works!' });
};
exports.getUser = getUser;
