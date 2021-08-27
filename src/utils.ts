/**
 * Portions adapted from https://github.com/actions/checkout/tree/5a4ac9002d0be2fb38bd78e4b4dbde5606d7042f (see LICENSE there which is MIT license)
 */

export const parseLines = (files: string): string[] => {
    return files.split(/\r?\n/).reduce<string[]>(
        (acc, line) =>
            acc
                .concat(line.split(','))
                .filter((pat) => pat)
                .map((pat) => pat.trim()),
        [],
    );
};
