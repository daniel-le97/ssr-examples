import Elysia from "elysia";

import { isProduction, port, serveDirectories, serveFromDir, serveFromRouter } from "./lib.ts";

import { autoroutes } from "elysia-autoroutes";
import { logger } from "./plugins/utils/logger.ts";


const app = new Elysia()
  .use(autoroutes({
    'prefix': 'api',
    routesDir: './routes'
  }))
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


      logger.box(`http://localhost:${port}`);


export type ElysiaApp = typeof app