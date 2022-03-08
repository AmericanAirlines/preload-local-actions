/* eslint-disable no-unused-vars */
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fshelper from './fs-helper';
import * as io from '@actions/io';
import * as github from '@actions/github';

/**
 * Portions adapted from https://github.com/actions/checkout/tree/2d1c1198e79c30cca5c3957b1e3b65ce95b5356e git-command-manager.ts (see LICENSE there which is MIT license)
 */

// requires git version 2.18 or greater to work

export interface IGitCommandManager {
    checkout(ref: string, startPoint: string): Promise<void>;

    config(configKey: string, configValue: string, globalConfig?: boolean): Promise<void>;

    setWorkingDirectory(workingDirectory: string): void;

    extractRepoName(repoPath: string): string;

    clone(repo: string, authToken: string): Promise<string>;

    prepareGitUrl(url: string, token: string): string;

    removeCredentials(string: string): Promise<boolean>;
}

export async function createCommandManager(workingDirectory: string): Promise<IGitCommandManager> {
    return await GitCommandManager.createCommandManager(workingDirectory);
}

export class GitCommandManager {
    private gitEnv: { [index: string]: string } = {
        GIT_TERMINAL_PROMPT: '0', // Disable git prompt
        GCM_INTERACTIVE: 'Never', // Disable prompting for git credential manager
    };
    private gitPath = '';
    private workingDirectory = '';

    // Private constructor; use createCommandManager()
    private constructor() {
        // default constructor is private to avoid being called
    }

    async checkout(ref: string, startPoint: string): Promise<void> {
        const args = ['checkout', '--progress', '--force'];
        if (startPoint) {
            args.push('-B', ref, startPoint);
        } else {
            args.push(ref);
        }

        await this.execGit(args);
    }

    async config(configKey: string, configValue: string, globalConfig?: boolean): Promise<void> {
        await this.execGit(['config', globalConfig ? '--global' : '--local', configKey, configValue]);
    }

    setWorkingDirectory(workingDirectory: string): void {
        this.workingDirectory = workingDirectory;
    }

    extractRepoName(repoPath: string): string {
        const col: number = repoPath.lastIndexOf('/');
        if (col < 0) {
            return repoPath;
        } else {
            return repoPath.substring(col + 1);
        }
    }

    /**
     * Do a git clone
     * @param {string} repo  For example: 'ownerOrOrg/my_repo'
     * @param {string} authToken Allows access to github repos
     * @returns {Promise<string>}
     */
    async clone(repo: string, authToken: string): Promise<string> {
        const url = this.prepareGitUrl(repo, authToken);

        const output = await this.execGit(['clone', url]);
        return output.stdout.trim();
    }

    prepareGitUrl(url: string, token: string): string {
        let repo = url;
        if (repo.indexOf('/') < 0) {
            console.log(`Owner/Org: ${github.context?.repo?.owner}`);
            // Find org of current repo and use it
            const owner = github.context?.repo?.owner;
            if (!owner) {
                throw new Error(`Missing owner/org on repo name. Format required: ownerOrOrg/my-repo. Found: ${repo}`);
            }
            repo = `${owner}/${repo}`;
        }
        repo = `github.com/${repo}`;
        if (!repo.endsWith('.git')) {
            repo = repo + '.git';
        }
        if (token) {
            repo = `x-access-token:${token}@${repo}`; // This is for a GitHub app
            // repo = `${token}:x-oauth-basic@${repo}` // This is for a user PAT
        }
        repo = 'https://' + repo;

        console.log(`Repo: ${repo}`);

        return repo;
    }

    async removeCredentials(repo: string): Promise<boolean> {
        const url = this.prepareGitUrl(repo, '');
        const output = await this.execGit(['remote', 'set-url', 'origin', url]);
        return output.exitCode != 0;
    }

    static async createCommandManager(workingDirectory: string): Promise<GitCommandManager> {
        const commandManager = new GitCommandManager();
        await commandManager.initializeCommandManager(workingDirectory);
        return commandManager;
    }

    private async execGit(args: string[], allowAllExitCodes = false, silent = false): Promise<GitOutput> {
        fshelper.directoryExistsSync(this.workingDirectory, true);

        const result = new GitOutput();

        const env: { [index: string]: string } = {};
        for (const key of Object.keys(process.env)) {
            env[key] = process.env[key] || '';
        }
        for (const key of Object.keys(this.gitEnv)) {
            env[key] = this.gitEnv[key] || '';
        }

        const stdout: string[] = [];

        const options = {
            cwd: this.workingDirectory,
            env,
            silent,
            ignoreReturnCode: allowAllExitCodes,
            listeners: {
                stdout: (data: Buffer) => {
                    stdout.push(data.toString());
                },
            },
        };

        result.exitCode = await exec.exec(`"${this.gitPath}"`, args, options);
        result.stdout = stdout.join('');
        return result;
    }

    async initializeCommandManager(workingDirectory: string): Promise<void> {
        this.workingDirectory = workingDirectory;

        this.gitPath = await io.which('git', true);
        console.log(`git executable is ${this.gitPath}`);

        // Git version
        core.debug('Getting git version');
        let gitVersion = '';
        const gitOutput = await this.execGit(['version']);
        const stdout = gitOutput.stdout.trim();
        if (!stdout.includes('\n')) {
            const match = stdout.match(/\d+\.\d+(\.\d+)?/);
            if (match) {
                gitVersion = match[0];
            }
        }
        if (!gitVersion) {
            throw new Error('Unable to determine git version');
        }
        console.log(`Git Version: ${gitVersion}`);

        // Set the user agent
        const gitHttpUserAgent = `git/${gitVersion} (github-actions-checkout)`;
        core.debug(`Set git useragent to: ${gitHttpUserAgent}`);
        this.gitEnv['GIT_HTTP_USER_AGENT'] = gitHttpUserAgent;
    }
}

class GitOutput {
    stdout = '';
    exitCode = 0;
}
