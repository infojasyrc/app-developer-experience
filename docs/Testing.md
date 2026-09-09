# Testing

## Content

- [For Github Actions](#for-github-actions)
  - [Requirements](#requirements)
  - [Considerations](#considerations)
  - [Commands](#commands)

## For Github Actions

### Requirements

- Install act

```bash
brew install act
```

### Considerations

** Notes:

- Run all commands from the root folder.
- In GitHub Actions workflows, replace conditional statements with `always`.

Example:

```yml
    if: always()
    # if: ${{ contains(needs.get-changed-packages.outputs.changed_packages, 'tpl-fastapi-rest') }}
```

### Commands

- **Command structure:**
    - `-e <file>`: Simulate the event using the specified file.
    - `-j <job>`: Specify the name of the job in the GitHub Action.

```bash
# run to validate changed packages
act -e devops/tests/events_simulate_changed_packages_conference_api.json -j get-changed-packages
```

```bash
# run to validate release and changelog for nestjs rest template
act -e devops/tests/events_simulate_release_nestjs_tpl.json -j changelog-nestjs-rest-tpl
```
