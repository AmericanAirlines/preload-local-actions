import * as core from '@actions/core';
import { parseLines } from './utils';
import { createCommandManager } from './git-command-manager';
import * as fsHelper from './fs-helper';
import * as io from '@actions/io';
import * as fs from 'fs';
import * as path from 'path';

async function run(): Promise<void> {
    try {
        // inputs:
        //  repository - string of repositories, on per line, with org and version
        //  token - a token with permission to load the repos
        //  path - relative path to where we load the repos' content
        const repositories = core.getInput('repository', { required: true });
        const authToken: string = core.getInput('token', { required: true });
        const workingDirectory: string = core.getInput('path', { required: false });

        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload: string = JSON.stringify(github.context.payload, undefined, 2)
        // console.log(`The event payload: ${payload}`)

        /* This portion adapted from https://github.com/actions/checkout/tree/5a4ac9002d0be2fb38bd78e4b4dbde5606d7042f (see LICENSE there which is MIT license) */

        // Remove conflicting file path
        if (fsHelper.fileExistsSync(workingDirectory)) {
            await io.rmRF(workingDirectory);
            console.log('A file with name of working directory removed');
        }

        // Create directory
        let isExisting = true;
        if (!fsHelper.directoryExistsSync(workingDirectory)) {
            isExisting = false;
            await io.mkdirP(workingDirectory);
            console.log('Working directory created since not present');
        }

        // Git command manager
        core.startGroup('Getting Git version info');
        const git = await createCommandManager(workingDirectory);
        core.endGroup();

        /* end of portion adapted from github actions/checkout action */

        if (isExisting) {
            // Delete the contents of the directory. Don't delete the directory itself
            // since it might be the current working directory.
            core.info(`Deleting the contents of '${workingDirectory}'`);
            for (const file of await fs.promises.readdir(workingDirectory)) {
                await io.rmRF(path.join(workingDirectory, file));
            }
            console.log('Deleted contents for working directory since files were existing');
        }

        for (const repository of parseLines(repositories)) {
            core.startGroup(`Loading action repository: ${repository}`);

            const tokens = repository.split('@');
            if (tokens.length < 2) {
                console.error('Error: Single repo format is like ownerOrOrg/my_repo@version');
                throw 'Error: invalid repo name/version';
            }

            console.log(`Loading ${tokens[0]} at tag/branch ${tokens[1]}`);
            git.setWorkingDirectory(workingDirectory);
            await git.clone(tokens[0], authToken);
            git.setWorkingDirectory(`${workingDirectory}/${git.extractRepoName(tokens[0])}`);
            await git.checkout(tokens[1], '');
            await git.removeCredentials(tokens[0]);

            core.endGroup();
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
