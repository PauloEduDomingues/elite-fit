import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { z } from 'zod'
import bcrypt from 'bcrypt';
import { createUserSchema } from './validations/create-user-schema';
import { createClientSchema } from './validations/create-client-schema';

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
    const body = createClientSchema.parse(request.body);
    const emailExists = await prisma.client.findUnique({ where: { email: body.email } });
    if(emailExists){
        return reply.status(400).send({'message': 'Email already exists!'});
    }
    await prisma.client.create({
        data: {
            body.name, 
            body.cpf,
            body.phone,
            body.email,
            body.address,
            body.number,
            body.neighborhood,
            body.complement,
            body.zipCode,
        }
    });
    return reply.status(201).send();
});

app.get('/clients/:id', async (request, reply) => {
    const getClientSchema = z.object({
        id: z.string()
    });
    const { id } = getClientSchema.parse(request.params);
    const client = await prisma.client.findUnique({ where: { id: Number(id) }});
    if(!client){
        return reply.status(404).send({
            message: 'Client not exists!'
        });
    }
    return reply.status(200).send(client);
});

app.post('/payments/clients/:id', async(request, reply) => {
    const getClientSchema = z.object({
        id: z.string()
    });
    const { id } = getClientSchema.parse(request.params);
    const client = await prisma.client.findUnique({
        where: {
            id: Number(id)
        }
    });
    console.log(client)
    if(!client){
        return reply.status(404).send({
            message: 'Client not exists!'
        });
    }
    const createPaymentSchema = z.object({
        amount: z.number().int(),
        paymentMethod: z.string(),
        due: z.string(),
    });
    const { amount, paymentMethod, due } = createPaymentSchema.parse(request.body);
    await prisma.payment.create({
        data: {
            clientId: Number(id),
            amount: amount,
            paymentMethod: paymentMethod,
            due: new Date(due)
        }
    })
    return reply.status(201).send(); 
});

app.get('/payments/clients/:id', async(request, reply) => {

    const getClientSchema = z.object({
        id: z.string(),
    })

    const { id } = getClientSchema.parse(request.params)

    const clientPayments = await prisma.payment.findMany({
        where: {
            clientId: Number(id),
        }
    })

    if (clientPayments.length == 0){
        return reply.status(404).send({
            message: 'No payments for this client'
        })
    }

    reply.status(200).send(clientPayments)
});

app.post('/payments/method', async(request, reply) => {
    const createPaymentMethodSchema = z.object({
        id: z.string(),
        name: z.string()
    });
    const { id, name } = createPaymentMethodSchema.parse(request.body);
    await prisma.paymentMethod.create({
        data: {
            id: id,
            name: name
        }
    });
    return reply.status(201).send();
});

app.get('/payments/method', async(request, reply) => {
    const paymentsMethods = await prisma.paymentMethod.findMany();
    reply.status(200).send(paymentsMethods);
});

app.post("/plans", async(request, reply) => {

    const createPlanSchema = z.object({
        name: z.string(),
        description: z.string(),
        price: z.number().int(),
        recurrency: z.enum(['MONTH', 'THREE_MONTH', 'SIX_MONTH', 'A_YEAR'])
    })

    const { name, description, price, recurrency } = createPlanSchema.parse(request.body);

    await prisma.plan.create({
        data: {
            name,
            description, 
            price,
            recurrency,
        }
    })
    reply.status(201).send()
})

app.get('/plans', async(request, reply) => {
    const plans = await prisma.plan.findMany();
    reply.status(200).send(plans)    
})

app.get("/plans/:id", async(request, reply) => {
    
    const createPlanSchema = z.object({
        id: z.string()
    })
    const { id } = createPlanSchema.parse(request.params)

    try{
        const plan = await prisma.plan.findUniqueOrThrow({
            where: {
                id: Number(id),
            }
        })

        reply.status(200).send(plan)

    }catch {
        return reply.status(404).send({
            message: "Plan not found!"
        })
    }
})

app.post('/subscriptions/clients/:clientId/plans/:planId', async(request, reply) => {
    const createClientSchema = z.object({
        clientId: z.string(),
        planId: z.string()
    })

    const { clientId,  planId } = createClientSchema.parse(request.params);

    const result = await Promise.all([
        prisma.client.findUnique({
            where: {
                id: Number(clientId)
            }
        }),
        prisma.plan.findUnique({
            where:{
                id: Number(planId)
            }
        })
    ])

    const client = result[0];
    const plan = result[1] 

    if (!client){
        return reply.status(404).send({
            message: "Client not exist!"
        })
    }
    if (!plan){
        return reply.status(404).send({
            message: "Plan not found!"
        })
    }

    await prisma.subscription.create({
        data: {
            clientId: Number(cliId),
            planId: Number(pId)
        }
    })

    return reply.status(201).send()
})

app.get('/subscriptions', async(request, reply) => {
    const subscriptions = await prisma.subscription.findMany()
    reply.status(200).send(subscriptions)
})

app.get('/subscriptions/clients/:clientId', async(request, reply) => {
    const createClientSchema = z.object({
        clientId: z.string()
    })

    const { clientId } = createClientSchema.parse(request.params)

    const subscriptions = await prisma.subscription.findMany({
        where: {
            clientId: Number(cliId)
        }
    })

    if (subscriptions.length == 0){
        return reply.status(404).send({
            message: 'No Subscription of client found!'
        })
    }
    return reply.status(200).send(subscriptions)
})


app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
    console.log('Server is running!');
})