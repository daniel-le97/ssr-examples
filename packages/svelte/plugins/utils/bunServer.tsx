import * as path from "path";
import { statSync } from "fs";
import type { ServeOptions } from "bun";
import { FileSystemRouter } from "bun";
// import  htmlContent from './index.html'
import { serveDirectories, port, serveFromRouter, serveFromDir } from '../../lib.ts';
// import { serveApiRoutes } from "./plugins/elysia/router.ts";

  // basic Bun native server to serve our app
  export default {
  port,
    async fetch ( request, server ) {
      // console.log(server.requestIP(request));
  
      const routerResponse = await serveFromRouter( request );
      if ( routerResponse )
      {
        return routerResponse;
      }
      let reqPath = new URL( request.url ).pathname;
      if ( reqPath === "/" )
      {
        reqPath = "/index.html";
      }
  
      
      const serveDirectory = serveFromDir( serveDirectories, reqPath );
      if ( serveDirectory )
      {
        return serveDirectory;
      }
      // const api = await serveApiRoutes(request)
  
      return new Response( "File not found", {
        status: 404,
      } );
    },
  } satisfies ServeOptions;
  

console.log( `http://localhost:${ port }` );
