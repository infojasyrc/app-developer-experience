const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

// Get the last tag/release to determine which commits to analyze
let lastTag;
try {
  lastTag = execSync('git describe --tags --abbrev=0', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
} catch (error) {
  // No tags exist yet
  lastTag = '';
}

// Get commits since the last tag
const command = lastTag 
  ? `git log ${lastTag}..HEAD --format="%s"` 
  : 'git log --format="%s"';

const commits = execSync(command).toString().trim().split('\n');

// Parse package.json to get current version
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Determine what kind of bump to do based on conventional commits
let shouldBumpMajor = false;
let shouldBumpMinor = false;
let shouldBumpPatch = false;

for (const commit of commits) {
  if (commit.includes('BREAKING CHANGE') || commit.match(/^breaking\s*:\s*/i)) {
    shouldBumpMajor = true;
    break;
  } else if (commit.match(/^feat(\([^)]*\))?\s*:\s*/)) {
    shouldBumpMinor = true;
  } else if (commit.match(/^fix(\([^)]*\))?\s*:\s*/)) {
    shouldBumpPatch = true;
  }
}

// Determine new version
let newVersion;
if (shouldBumpMajor) {
  newVersion = semver.inc(currentVersion, 'major');
} else if (shouldBumpMinor) {
  newVersion = semver.inc(currentVersion, 'minor');
} else if (shouldBumpPatch) {
  newVersion = semver.inc(currentVersion, 'patch');
} else {
  // No version bump needed
  console.log('No version bump needed based on recent commits.');
  process.exit(0);
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Generate/update changelog
execSync('npm run version');

console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
