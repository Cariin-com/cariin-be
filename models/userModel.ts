import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type UserType = Awaited<ReturnType<typeof prisma.user.findUnique>>;
type CreatedUserType = Awaited<ReturnType<typeof prisma.user.create>>;

export const findUserByEmail = async (email: string): Promise<UserType> => {
    return prisma.user.findUnique({ where: { email } });
};

export const createUser = async ({ name, email, phone, password }: { name: string; email: string; phone: string; password: string }): Promise<Partial<CreatedUserType>> => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { name, email, phone, password: hashedPassword },
        select: { id: true, name: true, email: true, phone: true }
    });
};

export const loginUser = async (email: string, password: string): Promise<UserType> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
};
