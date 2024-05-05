import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { z } from 'zod'
import bcrypt from 'bcrypt';

const app = fastify();

const prisma = new PrismaClient();

app.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany({
        select:{
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return reply.status(200).send(users);
});

app.post('/users', async (request, reply) => {
    const createUserSchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string()
    })
    const { name, email, password } = createUserSchema.parse(request.body);
    const emailExists = await prisma.user.findUnique({ 
        where: {
            email: email
        }
    });
    if(emailExists){
        return reply.status(400).send({'message': 'Email already exists!'});
    }
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data:{
            name,
            email,
            password: hash
        }
    });
    return reply.status(201).send();
});

app.get('/clients', async (request, reply) => {
    const clients = await prisma.client.findMany();
    return reply.status(200).send(clients);
});

app.post('/clients', async (request, reply) => {
    const createClientSchema = z.object({
        name: z.string(),
        cpf: z.string(),
        phone: z.string(),
        email: z.string().email(),
        address: z.string(),
        number: z.string(),
        neighborhood: z.string(),
        complement: z.string().optional(),
        zipCode: z.string(),
    })
    const {
        name, 
        cpf,
        phone,
        email,
        address,
        number,
        neighborhood,
        complement,
        zipCode,
    } = createClientSchema.parse(request.body);
    const emailExists = await prisma.client.findUnique({ 
        where: {
            email: email
        }
    });
    if(emailExists){
        return reply.status(400).send({'message': 'Email already exists!'});
    }
    await prisma.client.create({
        data: {
            name, 
            cpf,
            phone,
            email,
            address,
            number,
            neighborhood,
            complement,
            zipCode,
        }
    });
    return reply.status(201).send();
});

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
    console.log('Server is running!');
})