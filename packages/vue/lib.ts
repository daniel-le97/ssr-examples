import * as path from "path";
import { readdirSync, statSync } from "fs";
import type { ServeOptions } from "bun";
import { FileSystemRouter } from "bun";
import { buildRouter, srcRouter } from "./plugins/utils/routers.js";
import { createApp } from "./entry/index.js";
import { renderToString } from "vue/server-renderer";


export const PROJECT_ROOT = process.cwd()
export const PUBLIC_DIR = path.resolve( PROJECT_ROOT, "public" );
export const BUILD_DIR = path.resolve( PROJECT_ROOT, ".build" );
export const ASSETS_DIR = path.resolve( PROJECT_ROOT, 'assets' );
export const port = process.env.PORT ?? 3032

// add other directories you would like to serve statically here
export const serveDirectories = [ BUILD_DIR + '/client', ASSETS_DIR, PROJECT_ROOT, PUBLIC_DIR ];



export function serveFromDir (
    serveDirectories: string[],
    reqPath: string
  ): Response | null {
    for ( const dir of serveDirectories )
    {
      try
      {
        let pathWithSuffix = path.join( dir, reqPath );
        const stat = statSync( pathWithSuffix );
  
        if ( stat && stat.isFile() )
        {
  
          return new Response( Bun.file( pathWithSuffix ) );
        }
        continue;
      } catch ( error )
      {
        //do something here if the file should have been found from the directory
      }
    }
    return null;
  }
  

  export async function serveFromRouter ( request: Request ) {
    try
    {
      const match = srcRouter.match( request);
      
    //   console.log({match, req: request.url});
      
  
      if ( match )
      {
        const builtMatch = buildRouter.match( request );
        // console.log(builtMatch);
        
        if ( !builtMatch )
        {
          return new Response( "builtMatch not found", { status: 500 } );
        }
        
        let html = await Bun.file( './index.html' ).text();

        const page = await createApp( match.filePath );
        const tailwindcss = await Bun.file( './assets/output.css' ).text()
        
        const stream = await renderToString( page.app );
  
                    // set the page javascript we want to fetch for client
        html = html.replace( '{{ dynamicPath }}', '/pages/' + builtMatch.src )
                    // add the server side html to the html markup
                   .replace( '<!--html-body-->', stream )
                    
                   .replace('<!--html-head-->', `<style>${tailwindcss}</style>`)
  
  
        // send the finalized html  
        return new Response( html, {
          headers: { "Content-Type": "text/html;charset=utf-8" },
        } );
      }
    } catch ( error )
    {
      console.error(error)
      // do something here if the request should have been processed
    }
  
  }
  

