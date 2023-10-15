import { readdirSync } from "fs";
import * as path from 'path'

// helper function used to grab all files in a directory, currently unused
export default(directories: string[]): string[] => {
    let files: string[] = [];

    function traverseDirectory(dir: string, baseDir: string) {
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.isDirectory()) {
                traverseDirectory(fullPath, baseDir);
            } else {
                files.push(relativePath);
            }
        }
    }

    for (const directory of directories) {
        traverseDirectory(directory, directory);
    }

    return files;
}