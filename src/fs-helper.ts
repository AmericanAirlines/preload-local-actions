import * as fs from 'fs';

/**
 * Portions adapted from https://github.com/actions/checkout/tree/5a4ac9002d0be2fb38bd78e4b4dbde5606d7042f (see LICENSE there which is MIT license)
 */

export function directoryExistsSync(path: string, required?: boolean): boolean {
    if (!path) {
        throw new Error("Arg 'path' must not be empty");
    }

    let stats: fs.Stats;
    try {
        stats = fs.statSync(path);
    } catch (error) {
        if (error.code === 'ENOENT') {
            if (!required) {
                return false;
            }

            throw new Error(`Directory '${path}' does not exist`);
        }

        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${error.message}`);
    }

    if (stats.isDirectory()) {
        return true;
    } else if (!required) {
        return false;
    }

    throw new Error(`Directory '${path}' does not exist`);
}

export function existsSync(path: string): boolean {
    if (!path) {
        throw new Error("Arg 'path' must not be empty");
    }

    try {
        fs.statSync(path);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }

        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${error.message}`);
    }

    return true;
}

export function fileExistsSync(path: string): boolean {
    if (!path) {
        throw new Error("Arg 'path' must not be empty");
    }

    let stats: fs.Stats;
    try {
        stats = fs.statSync(path);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }

        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${error.message}`);
    }

    return !stats.isDirectory();
}
