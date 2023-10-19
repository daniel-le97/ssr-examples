import { Subprocess, spawn } from "bun";
import { WatchEventType, watch } from "fs";
import Elysia from "elysia";
import { Server } from 'bun'
import { buildCache, buildServerCache } from "./plugins/utils/cache.ts";
import { logger } from "./plugins/utils/logger.ts";
import { bundler } from "./build.ts";



let serverProcess: Subprocess | null = null;
let isRestarting = false;


const server: { instance: null | Server } = { instance: null }
// process.on('SIGSEGV', (signal) => {
//     logger.error('an error occured please restart dev server')
//     serverProcess?.kill(11)
// })

// we need a seperate server instance because the main one will turn off while reloading
const app = new Elysia()
.ws('/ws', {
  message(ws, message) {
      ws.send('hello world!')
  },
  open ( ws ) {
    ws.subscribe('refreshEvent')
    logger.info("LiveReload listening on ws://localhost:8127/ws");
  }
}).listen(8127, (serv) =>{
    server.instance = serv
})


async function startServer() {
    await bundler.build()
    isRestarting = true;
    logger.start( 'Starting server...' );
    serverProcess = spawn( {
        cmd: [ 'bun', 'index.ts' ],
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
        
        logger.info( `Detected ${ event } in ${ filename }` );
        buildCache.forEach( ( value, key ) => {
            if ( key.includes( filename ) )
            {
                buildCache.set( key, '' );
            }
        } );
        buildServerCache.forEach((value, key) => {
            if ( key.includes( filename ) )
            {
                buildServerCache.set( key, '' );
            }
        })
        const start = performance.now()
        await bundler.build()
        const end = performance.now();
        const elapsedMilliseconds = end - start
        logger.info( `rebundled in: ${ elapsedMilliseconds } ms` );
        
        isRestarting = false;
        // console.log('refreshed in ', (end - start) / 1000000);
        
        server.instance?.publish('refreshEvent', 'reload')
    } catch (error) {
        logger.warn(error)
        serverProcess ? serverProcess.kill(1) : ''
        process.exit(1)
    }
        
    };
    
    
    
    const watcher = watch(
    import.meta.dir,
    { recursive: true },
    fileWatch
);