"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.createUser = exports.findUserByEmail = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.user.findUnique({ where: { email } });
});
exports.findUserByEmail = findUserByEmail;
const createUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, email, phone, password }) {
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    return prisma.user.create({
        data: { name, email, phone, password: hashedPassword },
        select: { id: true, name: true, email: true, phone: true }
    });
});
exports.createUser = createUser;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        return null;
    const valid = yield bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        return null;
    return user;
});
exports.loginUser = loginUser;
