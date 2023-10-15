import { ImportInjectionResult, InjectImportsOptions, TypeDeclarationOptions, UnimportOptions, createUnimport,} from "unimport";
import { MagicString } from "vue/compiler-sfc";

class Importer {

    generate: (options?: TypeDeclarationOptions) => Promise<string>
    injectImports: (code: string | MagicString, id?: string, options?: InjectImportsOptions) => Promise<ImportInjectionResult>

    constructor(opts: UnimportOptions) {
        const importer = createUnimport(opts)
        this.injectImports = importer.injectImports     
        this.generate = importer.generateTypeDeclarations 
    }
}

export default new Importer({
        'addons':{'vueTemplate':true},
        'presets': [ 'vue' ],
    
    } as UnimportOptions)