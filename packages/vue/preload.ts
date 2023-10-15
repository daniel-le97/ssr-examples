


import { vue } from "./plugins/vue.js";
Bun.plugin( vue( {target: 'bun'} ) );
// Bun.plugin(
//     (await import("bun-auto-import")).autoImport({
//         // Options
//         // For example:
//         presets: ["@vue/composition-api"],
//         // imports: [{ name: "z", from: "zod" }],
        
//         // The generated .d.ts file path
//         // Default: `./auto-import.d.ts`
//         dts: `./src/auto-import.d.ts`,
//     })
//     )