import Elysia from "elysia";

export const postController = new Elysia({prefix: '/posts'}).get('/*', () => 'hello posts!')