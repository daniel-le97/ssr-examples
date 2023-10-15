import { BunPlugin } from "bun";

export const transpileTS = ( code: string, loader: 'ts' | 'js' = 'ts' ) => {
    const transpiler = new Bun.Transpiler( { loader } );
    const content = transpiler.transformSync( code );
    return content;
  };
  

export const html: BunPlugin = {
    name: 'html',
    async setup ( build ) {
        build.onLoad( { filter: /\.html$/ }, async ( args ) => { 
            // console.log('building');
            
            let  content = await Bun.file(args.path).text()

            // content = content.replace('<!--html-head-->', `<style>${generateCSS}</style>\n<!--html-head-->`)
            

            const exporter = `const html = ${JSON.stringify(content)}\nexport default html`
            return {
                'contents': transpileTS(exporter),
                loader: 'js'
            }
         } );
    }
};