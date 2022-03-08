import * as fs from 'fs';

/**
 * Portions adapted from https://github.com/actions/checkout/tree/2d1c1198e79c30cca5c3957b1e3b65ce95b5356e fs-helper.ts (see LICENSE there which is MIT license)
 */

export function directoryExistsSync(path: string, required?: boolean): boolean {
    if (!path) {
        throw new Error("Arg 'path' must not be empty");
    }

    let stats: fs.Stats;
    try {
        stats = fs.statSync(path);
    } catch (error) {
        if ((error as any)?.code === 'ENOENT') {
            if (!required) {
                return false;
            }

            throw new Error(`Directory '${path}' does not exist`);
        }

        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${(error as any)?.message ?? error}`);
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
        if ((error as any)?.code === 'ENOENT') {
            return false;
        }

        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${(error as any)?.message ?? error}`);
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
        if ((error as any)?.code === 'ENOENT') {
            return false;
        }

        throw new Error(`Encountered an error when checking whether path '${path}' exists: ${(error as any)?.message ?? error}`);
    }

    if (!stats.isDirectory()) {
        return true;
    }

    return false;
}
