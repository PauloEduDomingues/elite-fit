import axios from 'axios';
import {describe, expect, it} from 'vitest'

const api = axios.create({
    baseURL: 'http://localhost:3333'
});

describe('user', () => {
    
    it('should create a user', async () => {
        const userInput = {
            name: "Lucas",
            email: `lucas${Math.random()}@email.com`,
            password: "1234"
        }
        const createUserResponse = await api.post('/users', userInput);
        const getUserResponse = await api.get('/users');
        expect(createUserResponse.status).toBe(201);
        expect(getUserResponse.data).toEqual(
            getUserResponse.data.expect.objectContaining(userInput)
        );
    });

});