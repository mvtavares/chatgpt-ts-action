<p align="center">
  <a href="https://github.com/mvtavares/chatgpt-ts-action/actions"><img alt="chatgpt-ts-action status" src="https://github.com/mvtavares/chatgpt-ts-action/workflows/build-test/badge.svg"></a>
</p>

# chatgpt-action - Fork of the https://github.com/kxxt/chatgpt-action/ action to Typescript

Let chatgpt review your PR.


## Showcase

### YOLO Mode: Give all the info to ChatGPT in one go

- https://github.com/kxxt/chatgpt-action/pull/12


## Usage

```yaml
on: [pull_request]

name: ChatGPT CodeReview

jobs:
  chatgpt_comment:
    runs-on: ubuntu-latest
    name: Let chatgpt comment on your PR.
    steps:
      - name: ChatGPT comment
        uses: mvtavares/chatgpt-action@v0.1
        id: chatgpt
        with:
          number: ${{ github.event.pull_request.number }}
          sessionToken: ${{ secrets.CHATGPT_SESSION_TOKEN }}
          split: 'yolo'  # Use true to enable the unstable split feature.
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```


## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
