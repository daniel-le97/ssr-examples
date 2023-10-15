import Elysia from "elysia";
import { ElysiaApp } from "../index.ts";
import { postController } from "./posts/index.ts";


    //http://localhost:3000/api/
export const routesController = new Elysia({prefix: '/api'}).use(postController).get('/', () => 'hello world!')