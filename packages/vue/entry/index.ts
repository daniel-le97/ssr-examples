import { createSSRApp} from 'vue';


export async function createApp (path?: string) {
    const home = await import( path || `../pages/index.${process.isBun ? 'vue' : 'js'}`)
    const app = createSSRApp( home.default);
    return {app}

}