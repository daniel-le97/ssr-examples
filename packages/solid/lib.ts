import * as path from "path";
import { readdirSync, statSync } from "fs";
import type { ServeOptions } from "bun";
import { FileSystemRouter } from "bun";
import  htmlContent from './index.html'
import { clientRouter, serverRouter } from "./plugins/utils/routers.ts";

export const PROJECT_ROOT = process.cwd()
export const PUBLIC_DIR = path.resolve( PROJECT_ROOT, "public" );
export const BUILD_DIR = path.resolve( PROJECT_ROOT, "build" );
export const ASSETS_DIR = path.resolve( PROJECT_ROOT, 'assets' );
export const port = process.env.PORT ?? 3124

// add other directories you would like to serve statically here
export const serveDirectories = [ BUILD_DIR + '/client', ASSETS_DIR];



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
      const match = serverRouter.match( request);
      
    //   console.log({match, req: request.url});
      
  
      if ( match )
      {
        const builtMatch = clientRouter.match( request );
        // console.log(builtMatch);
        
        if ( !builtMatch )
        {
          return new Response( "builtMatch not found", { status: 500 } );
        }
        
        // import index.html for use as the html shell
        let html = htmlContent

        
        // @ts-ignore rebuilt every build
        const page = (await (await import(Bun.resolveSync('./build/ssr/entry/entry-server.js', process.cwd()))).render(match.filePath))

        // @ts-ignore rebuilt every build
        // const css = (await import(Bun.resolveSync('./build/ssr/main.css.js', process.cwd()))).default
        
        const tailwind = await Bun.file(ASSETS_DIR + '/output.css').text()
        const tailwindcss = `<style>${tailwind}</style>\n`
        // const head = `<style>${css}</style>\n`
        
  
                    // set the page javascript we want to fetch for client
        html = html.replace( '{{ dynamicPath }}', '/pages/' + builtMatch.src )
                    // add solids hydration script to the head
                    .replace('<!--html-head-->', tailwindcss + page.head)
                    // add the server side html to the html markup
                   .replace( '<!--html-body-->', page.html )
  
  
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
  

