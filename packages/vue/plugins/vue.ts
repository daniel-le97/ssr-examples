import { BunPlugin } from "bun";
import { basename } from "path";
import { compileScript, compileStyle, compileTemplate, parse, rewriteDefault, SFCDescriptor, SFCScriptCompileOptions, SFCTemplateCompileOptions, SFCAsyncStyleCompileOptions, compileStyleAsync} from "vue/compiler-sfc";
import importer from "./autoImport.ts";

export function validateDenpendency() {
  try {
      require.resolve('vue/compiler-sfc')
  } catch {
      throw new Error('vue/compiler-sfc has not been installed')
  }
}

export const transpileTS = ( code: string, loader: 'ts' | 'js' = 'ts' ) => {
  const transpiler = new Bun.Transpiler( { loader } );
  const content = transpiler.transformSync( code );
  return content;
};

export interface Options {
  // include?: string | RegExp | ( string | RegExp )[];
  // exclude?: string | RegExp | ( string | RegExp )[]
  
 /**
   * @default process.env.NODE_ENV = "production"
   */
  isProduction?: boolean
  /**
   * @default 'browser'
   */
  target: 'browser' | 'bun'

  // options to pass on to vue/compiler-sfc
  script?: Partial<
      Pick<
          SFCScriptCompileOptions,
          | 'babelParserPlugins'
          | 'globalTypeFiles'
          | 'defineModel'
          | 'propsDestructure'
          | 'fs'
          | 'reactivityTransform'
          | 'hoistStatic'
      >
  >;
  template?: Partial<
      Pick<
          SFCTemplateCompileOptions,
          | 'compiler'
          | 'compilerOptions'
          | 'preprocessOptions'
          | 'preprocessLang'
          | 'preprocessCustomRequire'
          | 'transformAssetUrls'
          | 'ssr'
      >
  >;
  style?: Pick<
      SFCAsyncStyleCompileOptions,
      'modulesOptions' | 'preprocessLang' | 'preprocessOptions' | 'postcssOptions' | 'postcssPlugins'
  >
}


export const vue = ( options: Options ) => {
  validateDenpendency();
  const isProd = options.isProduction ?? Bun.env.NODE_ENV === 'production';
  const ssr = options.template?.ssr ?? options.target === 'bun';
  const isBun = options.target === 'bun'


  const compileScriptOrSetupDefault = ( descriptor: SFCDescriptor, options: Options, id: string ) => {
    const content = descriptor.scriptSetup?.setup
      ? compileScript( descriptor, {
        
        ...options.script, id, inlineTemplate: true, templateOptions: descriptor.template ? { ...options.template, ssr: options.target === 'bun', ssrCssVars: [] } : {}
      } ).content.replace( "export default ", "let sfc = " ) + ";\n"
      : descriptor.script ? rewriteDefault( compileScript( descriptor, { ...options.script, id } ).content, "sfc" ) : 'let sfc = {};\n';
    return content;
  };
  const vue: BunPlugin = {
    name: 'bun-vue',
    async setup ( build ) {
      if (build.config && options.target === 'browser') {
        build.config.define = {
          __VUE_OPTIONS_API__: "true",
          __VUE_PROD_DEVTOOLS__: "true"
        }
      }

      build.onLoad( { filter: /\.vue$/ }, async ( args ) => {
        // console.log(args.path);



        const { descriptor, errors: parseErrors } = parse(
          await Bun.file( args.path ).text(), {
          filename: basename( args.path ),
        } );

        // Handle parse errors
        if ( parseErrors.length > 0 )
        {
          throw new Error( parseErrors.join( '\n' ) );
        }
        // generate an id based off path hash

        const id = Bun.hash( args.path ).toString();

        // helper function to sort what the start of our code should look like scrip | script w/ setup / none
        let code = compileScriptOrSetupDefault( descriptor, options, id );
  
        if ( !!descriptor.template?.content && !descriptor.scriptSetup )
        {
          // Compile template
          const template = compileTemplate( {
            ...options.template,
            isProd,
            ssr,
            id,
            preprocessLang: descriptor.template.lang,
            preprocessOptions: options.template?.preprocessOptions,
            filename: basename( args.path ),
            ssrCssVars: [],
            source: descriptor.template?.content!,
            scoped: true,
          } );
          // Add template code
          code += template.code.replace( "export function", "function" );
          // add rendering function if there isnt a "setup"
          code += ssr ? "\nsfc.ssrRender = ssrRender;\n" : "\nsfc.render = render;\n";
        }

        code = (await importer.injectImports(code)).code
        // console.log(code);
        

        // Compile and add styles if not in SSR mode
        if ( !ssr )
        {
  
          const stylesCode = descriptor.styles
            .map(( style, i ) =>
            {
              // console.log(style.lang);
              
              return compileStyle( {
                id,
                source: style.content,
                filename: basename( args.path ),
                'preprocessLang': JSON.stringify(style.lang) as SFCAsyncStyleCompileOptions['preprocessLang'],
                // descriptor.styles[i].lang as SFCAsyncStyleCompileOptions['preprocessLang'],
                'preprocessOptions': options?.style?.preprocessOptions,
                isProd,
                scoped: style.scoped,
              } ).code
        })
            .join( "\n" );

          if ( stylesCode )
          {
            const cssCode = `
                let head = document.head;
                let style = document.createElement("style");
                head.appendChild(style);
                style.type = "text/css";
                style.appendChild(document.createTextNode(\`${ stylesCode }\`));`;
            // cssCache.push( stylesCode );
            // console.log( stylesCode );

            code += cssCode;
          }

        }

        code += 'export default sfc;\n';

        return {
          contents: transpileTS( code ),
          loader: "js",
        };

      } );
    },
  };

  return vue;
};
