import { Subprocess, spawn } from "bun";
import { WatchEventType, watch } from "fs";
import Elysia from "elysia";
import { Server } from 'bun'
import { build } from "./build.ts";
import { buildCache, buildServerCache } from "./plugins/utils/cache.ts";
import consola from "consola";

let serverProcess: Subprocess | null = null;
let isRestarting = false;

const server: { instance: null | Server } = { instance: null }

// we need a seperate server instance because the main one will turn off while reloading
const app = new Elysia()
.ws('/ws', {
  message(ws, message) {
      ws.send('hello world!')
  },
  open ( ws ) {
    ws.subscribe('refreshEvent')
    consola.info("LiveReload listening on ws://localhost:8127/ws");
  }
}).listen(8127, (serv) =>{
    server.instance = serv
})


async function startServer() {
    // await build(true)
    isRestarting = true;
    consola.start( 'Starting server...' );
    serverProcess = spawn( {
        cmd: [ 'bun', 'index.ts', '--hot' ],
        env: Bun.env,
        stdio: [ 'inherit', 'inherit', 'inherit' ]
    } );
    const exitCode = serverProcess.exitCode;
    if ( exitCode )
    {
        
        process.exit( exitCode );
    }
    return serverProcess;
}

// Start the server initially
await startServer();




const fileWatch = async ( event: WatchEventType, filename: string | Error | undefined ) => {
    try {
        if ( filename instanceof Error )
        {
            process.exit( 1 );
        }
        
        if ( !filename || event !== 'change' )
        {
            return;
        }
        
        const exclude = [ 'build', 'node_modules', '.git' , '.css', 'README'];
        if ( exclude.find( excl => filename?.includes( excl ) ) )
        {
            return;
        }
        if ( !serverProcess )
        {
            return;
        }
        
        consola.info( `Detected ${ event } in ${ filename }` );
        buildCache.forEach( ( value, key ) => {
            // key.includes(filename)
            if ( key.includes( filename ) )
            {
                buildCache.set( key, '' );
            }
        } );
        buildServerCache.forEach( ( value, key ) => {
            // key.includes(filename)
            if ( key.includes( filename ) )
            {
                buildServerCache.set( key, '' );
            }
        } );

        const start = performance.now()
        await build( false )
        const end = performance.now();
        const elapsedMilliseconds = end - start
        consola.info( `rebundled in: ${ elapsedMilliseconds } ms` );
        
        isRestarting = false;
        // console.log('refreshed in ', (end - start) / 1000000);
        
        server.instance?.publish('refreshEvent', 'reload')
    } catch (error) {
        consola.warn(error)
        serverProcess ? serverProcess.kill(1) : ''
        process.exit(1)
    }
        
    };
    
    
    
    const watcher = watch(
    import.meta.dir,
    { recursive: true },
    fileWatch
);