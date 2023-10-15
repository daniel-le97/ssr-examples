// this is the router for built pages
export const srcRouter = new Bun.FileSystemRouter( {
    dir: './pages',
    style: "nextjs",
    fileExtensions: [ '.vue' ]
  } );
export const buildRouter = new Bun.FileSystemRouter( {
    dir: './.build/client/pages',
    style: "nextjs",
  } );
  
  