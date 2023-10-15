import { ElysiaApp } from "../index.ts";

export default (app: ElysiaApp) => {
    //http://localhost:3000/api/
   return app
    .get('/', (ctx) =>  'hello world')
    .post('/', (ctx) => ctx.body)
}