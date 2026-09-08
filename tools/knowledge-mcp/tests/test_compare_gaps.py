from knowledge.gaps import STACK_MISMATCH, compare_gaps


def _complete_manifest(**overrides) -> dict:
    manifest = {
        "files": ["Makefile", "Dockerfile", ".husky/commit-msg", "commitlint.config.js"],
        "makefile_targets": [
            "build-dev",
            "install-dependencies",
            "lint",
            "help",
            "launch-local",
            "stop-local",
            "unit-tests",
            "build-prod",
        ],
        "makefile_wraps_docker": True,
        "makefile_wraps_host_runtime": False,
        "tools": ["commitlint"],
        "stack": ["nestjs"],
    }
    manifest.update(overrides)
    return manifest


def test_complete_repo_has_no_gaps():
    result = compare_gaps(_complete_manifest())
    assert result["ok"] is True
    assert result["gaps"] == []
    assert result["gap_count"] == 0


def test_missing_makefile():
    result = compare_gaps(_complete_manifest(files=["Dockerfile", "commitlint.config.js"]))
    codes = {gap["code"] for gap in result["gaps"]}
    assert "missing-makefile" in codes


def test_makefile_missing_core_targets():
    result = compare_gaps(
        _complete_manifest(makefile_targets=["lint", "help", "launch-local", "stop-local", "unit-tests"])
    )
    details = " ".join(gap["detail"] for gap in result["gaps"])
    assert "build-dev" in details
    assert "install-dependencies" in details
    assert {gap["code"] for gap in result["gaps"]} == {"missing-make-target"}


def test_makefile_wrapping_host_runtime_is_a_gap():
    result = compare_gaps(_complete_manifest(makefile_wraps_host_runtime=True))
    assert any(gap["code"] == "makefile-wraps-host-runtime" for gap in result["gaps"])


def test_missing_dockerfile():
    result = compare_gaps(_complete_manifest(files=["Makefile", "commitlint.config.js"]))
    assert any(gap["code"] == "missing-dockerfile" for gap in result["gaps"])


def test_missing_conventional_commits():
    result = compare_gaps(_complete_manifest(files=["Makefile", "Dockerfile"], tools=[]))
    assert any(gap["code"] == "missing-conventional-commits" for gap in result["gaps"])


def test_expect_iac_without_signals():
    result = compare_gaps(_complete_manifest(expect_iac=True))
    assert any(gap["code"] == "missing-iac" for gap in result["gaps"])


def test_conference_manager_stack_mismatch_is_documented_exception():
    result = compare_gaps(
        _complete_manifest(
            identity="conference-manager",
            path="conference-manager/",
            stack=["django"],
        )
    )
    codes = {gap["code"] for gap in result["gaps"]}
    assert STACK_MISMATCH not in codes
    assert result["documented_exceptions"]
    exception = result["documented_exceptions"][0]
    assert exception["code"] == STACK_MISMATCH
    assert exception["status"] == "documented_exception"
    assert "000-core.mdc" in exception["source"]


def test_django_stack_outside_cm_is_a_gap():
    result = compare_gaps(_complete_manifest(identity="other-app", stack=["django"]))
    assert any(gap["code"] == STACK_MISMATCH for gap in result["gaps"])
    assert result["documented_exceptions"] == []


def test_compare_gaps_accepts_json_string():
    import json

    result = compare_gaps(json.dumps(_complete_manifest()))
    assert result["gaps"] == []
