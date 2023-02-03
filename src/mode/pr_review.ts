import * as core from "@actions/core";
import { genReviewPRPrompt, genReviewPRSplitedPrompt } from "../prompt";
import { callChatGPT, startConversation } from "../chatgpt";
import { Octokit } from "@octokit/action";
import * as github from "@actions/github";

const octokit = new Octokit();
const context = github.context;

async function runPRReview({ api, owner,repo, pull_number, split }: { api: any, owner: string,repo: string,pull_number: number, split: string }) {
    const { data: { title, body } } = await octokit.pulls.get({
        owner,
        repo,
        pull_number,
    });
    const { data: diff } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
        mediaType: {
            format: "diff",
        },
    });
    let reply: string;
    if (split === "yolo") {
        // check this line
        const prompt = genReviewPRPrompt(title, body ?? "", JSON.stringify(diff));
        core.info(`The prompt is: ${prompt}`);
        const response = await callChatGPT(api, prompt, 5);
        reply = response;
    } else {
        throw "Not implemented!";
    }
    await octokit.issues.createComment({
        ...context.repo,
        issue_number: pull_number,
        body: reply,
    });
}

export { runPRReview };
