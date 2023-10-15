/** @type {import('tailwindcss').Config} */
export default {
  content: ["./components/**/*.{html,js,tsx,jsx,ts}", "./pages/**/*.{html,js,tsx,jsx,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
}


// import { defineConfig } from '@twind/core'
// import presetAutoprefix from '@twind/preset-autoprefix'
// import presetTailwind from '@twind/preset-tailwind'
// export default defineConfig({
//   presets: [presetAutoprefix(), presetTailwind()],
// })