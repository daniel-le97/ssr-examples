import Elysia from "elysia";
import { port, serveDirectories, serveFromDir, serveFromRouter } from "./lib.ts";
import consola from "consola";
import { routesController } from "./server/routes/index.js";



const app = new Elysia()
    .use(routesController)
    .get( '*', async ( ctx ) => {
        // console.log(ctx.request);
        const routerRes = await serveFromRouter(ctx.request)
        if (routerRes) { 
            return routerRes
        }

        let reqPath = new URL( ctx.request.url ).pathname;
              if ( reqPath === "/" )
              {
                reqPath = "/index.html";
              }
        const serveDirectory = serveFromDir( serveDirectories, reqPath );
      if ( serveDirectory )
      {
        return serveDirectory;
      }
    } ).listen(port)
consola.box(`http://localhost:${port}`);

export type ElysiaApp = typeof app