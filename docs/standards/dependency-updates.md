# Dependency Updates

## Node.js base images

Container images that use Node.js track the **LTS line only** (currently **24**,
`node:24-alpine`). Non-LTS (odd-numbered) releases such as 25 must not be adopted.

- `.github/dependabot.yml` tracks package managers only (`uv` and `npm`). It does
  not update Dockerfiles. When the team adopts the next LTS, change the image tag
  in the Dockerfile.

## Dependabot commits and commitlint

Dependabot commit bodies contain long changelog lines that break
`body-max-line-length`. The root `commitlint.config.js` skips only commits
carrying `Signed-off-by: dependabot[bot]`; human commits are fully validated.
