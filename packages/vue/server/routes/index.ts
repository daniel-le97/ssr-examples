import Elysia from "elysia";



    //http://localhost:3000/api/
export const routesController = new Elysia({prefix: '/api'}).get('/', () => 'hello world!')