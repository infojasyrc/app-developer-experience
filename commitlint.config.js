// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  // Dependabot bodies embed changelog lines longer than body-max-line-length (100).
  // Skip only bot-authored commits; human commits stay fully validated.
  ignores: [(message) => message.includes("Signed-off-by: dependabot[bot]")],
};
