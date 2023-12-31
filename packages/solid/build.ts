import { BunPlugin, FileSystemRouter } from "bun";
import { generateTypes, solidPlugin } from "./plugins/solid.ts";
import * as path from 'path';
import { existsSync, rmSync } from "fs";
import consola from "consola";
import { html } from "./plugins/html.ts";
import { postcssAPI } from "./plugins/postcss.ts";

interface BundlerConfig {
  isProd: boolean;
  projectRoot: string;
  buildDir: string;
  clientEntry: string;
  serverEntry: string;
  cssEntry: string;
  cssOutput: string;
  pagesDir: string;
  clientPlugins: BunPlugin[];
  serverPlugins: BunPlugin[];
}

class Bundler {
  private config: BundlerConfig;

  constructor(config: BundlerConfig) {
    this.config = config;
  }

  private async cleanBuildDirectory() {
    if (existsSync(this.config.buildDir)) {
      rmSync(path.join(this.config.buildDir, 'client'), { recursive: true, force: true });
      rmSync(path.join(this.config.buildDir, 'ssr'), { recursive: true, force: true });
    }
  }

  private async buildClient() {
    const router = new FileSystemRouter({
      style: 'nextjs',
      dir: this.config.pagesDir,
    });

    const clientBuild = await Bun.build({
      entrypoints: [this.config.clientEntry, ...Object.values(router.routes)],
      splitting: true,
      target: 'browser',
      outdir: path.join(this.config.buildDir, 'client'),
      minify: this.config.isProd,
      plugins: [...this.config.clientPlugins],
    });
  }

  private async buildServer() {
    const router = new FileSystemRouter({
      style: 'nextjs',
      dir: this.config.pagesDir,
    });

    const serverBuild = await Bun.build({
      entrypoints: [this.config.serverEntry, ...Object.values(router.routes)],
      splitting: true,
      target: 'bun',
      minify: this.config.isProd,
      outdir: path.join(this.config.buildDir, 'ssr'),
      plugins: this.config.serverPlugins,
    });
  }

  private async buildProd() {
    const prodBuild = await Bun.build({
      entrypoints: ['./index.ts'],
      splitting: false,
      target: 'bun',
      minify: false,
      outdir: this.config.buildDir,
      plugins: this.config.serverPlugins,
    });
  }

  private async generateDeclarations() {
    const declarations = `
/// <reference lib='dom'/>
/// <reference lib='dom.iterable'/>\n
      declare module '*.html' {
          const content: string;
          export default content;
      }\n
      declare module '*.svg' {
          const content: string;
          export default content;
      }`;

    await Bun.write(path.join(this.config.buildDir, 'imports.d.ts'), generateTypes);
    await Bun.write(path.join(this.config.buildDir, 'lib.d.ts'), declarations);
  }

 private async generateCSS(){
    await postcssAPI(this.config.cssEntry, this.config.cssOutput)
  }

  public async build() {
    try {
      consola.info('starting build');
      const start = performance.now();

      await this.cleanBuildDirectory();
      await this.buildClient();
      await this.buildServer();

      if (this.config.isProd) {
        await this.buildProd();
      }

      await this.generateDeclarations();
      await this.generateCSS()

      const end = performance.now();
      consola.success('build finished in: ', (end - start).toFixed(2), ' ms');
    } catch (error) {
      console.log(error);
    }
  }
}

// Usage
const config: BundlerConfig = {
  isProd: process.env.NODE_ENV === 'production',
  projectRoot: process.cwd(),
  buildDir: path.resolve(process.cwd(), "build"),
  clientEntry: path.join(process.cwd(), 'entry/entry-client.tsx'),
  serverEntry: path.join(process.cwd(), 'entry/entry-server.tsx'),
  cssEntry: path.join(process.cwd(), 'assets/app.css'),
  cssOutput: path.join(process.cwd(), 'assets/output.css'),
  pagesDir: './pages', // Replace with your pages directory path
  clientPlugins: [solidPlugin], // Add your client-specific plugins
  serverPlugins: [solidPlugin, html], // Add your server-specific plugins
};

export const bundler = new Bundler(config);
if (import.meta.path === Bun.main) {
  // if this script is being directly executed do this
  bundler.build();
}


