import {createCommandManager, GitCommandManager} from '../src/git-command-manager'
import {expect, test} from '@jest/globals'
import * as github from '@actions/github'
import {PayloadRepository} from "@actions/github/lib/interfaces";

describe('git-command-manager tests', () => {

    beforeAll(() => {
        jest.spyOn(GitCommandManager.prototype, 'initializeCommandManager').mockImplementation(
            async (workingDirectory: string): Promise<void> => Promise.resolve()
        );
    })

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('should build clone address when org supplied with repo name', async () => {
        const git = await createCommandManager('workingDirectory')
        const url = git.prepareGitUrl('ownerOrOrg/myrepo', 'authToken')
        expect(url).toBe('https://x-access-token:authToken@github.com/ownerOrOrg/myrepo.git')
    })

    test('should build clone address with missing org and no github.context', async () => {
        // Mock github context
        jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
            return {
                owner: '',
                repo: ''
            }
        })

        const git = await createCommandManager('workingDirectory')
        // const url = git.prepareGitUrl('myrepo', 'authToken')
        // expect(url).toBe('https://x-access-token:authToken@github.com/ownerOrOrg/myrepo.git')

        const t = () => {
            git.prepareGitUrl('myrepo', 'authToken')
        };
        // expect(t).toThrow(Error);
        expect(t).toThrow("Missing owner/org on repo name. Format required: ownerOrOrg/my-repo. Found: myrepo");
    })

    test('should build clone address with github.context.repo holding default owner', async () => {
        // Mock github context
        jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
            return {
                owner: 'myOrg',
                repo: 'some-repo'
            }
        })

        const git = await createCommandManager('workingDirectory')
        const url = git.prepareGitUrl('myrepo', 'authToken')

        expect(url).toBe('https://x-access-token:authToken@github.com/myOrg/myrepo.git')
    })

    test('should extract repo name given org/repoName', async () => {
        const git = await createCommandManager('workingDirectory')
        const repoName = git.extractRepoName('ownerOrOrg/myrepo')
        expect(repoName).toBe('myrepo')
    })

})