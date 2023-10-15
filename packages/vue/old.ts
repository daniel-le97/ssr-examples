const timer = Bun.nanoseconds()
import { createConsola } from "consola";
import { vue } from "./plugins/vue";
import * as path from "path";
import { existsSync, readdirSync, rmSync, statSync } from "fs";
import type { ServeOptions } from "bun";
import { renderToString } from "vue/server-renderer";
import { createApp } from "./entry/index";
import { FileSystemRouter } from "bun";
// import { scssPlugin} from "./plugins/scss";
const logger = createConsola();



// constants
const isProd = process.env.NODE_ENV === 'production';
const PROJECT_ROOT = import.meta.dir;
const PUBLIC_DIR = path.resolve( PROJECT_ROOT, "public" );
const BUILD_DIR = path.resolve( PROJECT_ROOT, ".build" );
const ASSETS_DIR = path.resolve( PROJECT_ROOT, 'assets' );
const serveDirectories = [ BUILD_DIR + '/client', ASSETS_DIR, PROJECT_ROOT, PUBLIC_DIR ];
const port = process.env.PORT || 3421
// const indexCSS = '/main.css';

// get the pages from the filesystem to add as entrypoints for our bundler
const srcRouter = new FileSystemRouter( {
  dir: './pages',
  style: "nextjs",
  fileExtensions: [ '.vue' ]
} );

// we want to clear our build directory for the bundling that follows after this
if ( existsSync( BUILD_DIR ) )
  logger.info( 'clearning build dir ', BUILD_DIR );
rmSync( BUILD_DIR, { recursive: true, force: true } );
logger.success( 'build dir cleaned', BUILD_DIR );

// console.log(srcRouter);


// build our vue ssr app
logger.start( 'bundling client' );
const build = await Bun.build( {
  entrypoints: [ import.meta.dir + '/entry/entry-client.ts', ...Object.values( srcRouter.routes )],
  outdir: BUILD_DIR + '/client',
  splitting: true,
  target: 'browser',
  plugins: [
    vue( {target: 'browser'} ),
    // scssPlugin,
    // otherFiles,
  ],
  minify: false,
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "true"
  }
} );

if (!build.success) {
  logger.error(build)
  process.exit(1)
}

// this is the router for built pages
const buildRouter = new Bun.FileSystemRouter( {
  dir: BUILD_DIR + '/client/pages',
  style: "nextjs",
} );

// helper function to serve files from the directory - .build/assets/public
function serveFromDir (
  serveDirectories: string[],
  reqPath: string
): Response {
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

// helper function to update our html and send it
async function serveFromRouter ( request: Request ) {
  try
  {
    const match = srcRouter.match( request);
    // console.log(match);
    

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
   
      
      const stream = await renderToString( page.app );

                  // set the page javascript we want to fetch for client
      html = html.replace( '{{ dynamicPath }}', '/pages/' + builtMatch.src )
                  // add the server side html to the html markup
                 .replace( '<!--html-body-->', stream )


      // send the finalized html
      return new Response( html, {
        headers: { "Content-Type": "text/html;charset=utf-8" },
      } );
    }
  } catch ( error )
  {
    // do something here if the request should have been processed
  }

}


// basic Bun native server to serve our app
export default {
  port,
  async fetch ( request ) {
console.log(request.url);

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

    return new Response( "File not found", {
      status: 404,
    } );
  },
} satisfies ServeOptions;

const end = Bun.nanoseconds()
logger.box( `http://localhost:${port}` , '\nready in', (end - timer) / 1e9);
// logger.log((end - timer) / 1e9);


