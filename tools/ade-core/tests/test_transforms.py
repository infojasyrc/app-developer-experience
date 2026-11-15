import pytest

from ade_core.adapters.transforms import dotenv, json_edit, makefile, text
from ade_core.domain.errors import StaleManifestError

ENV = "A=1\n# comment\nB=2\n\nPROJECT_NAME=x\nPLATFORM=linux/amd64\n"


def test_dotenv_set_keeps_layout():
    result = dotenv.set_values(ENV, {"B": "3", "PLATFORM": "linux/arm64"})
    assert result == "A=1\n# comment\nB=3\n\nPROJECT_NAME=x\nPLATFORM=linux/arm64\n"


def test_dotenv_set_missing_key_is_stale():
    with pytest.raises(StaleManifestError, match="NOPE"):
        dotenv.set_values(ENV, {"NOPE": "1"})


def test_dotenv_remove_keys():
    assert dotenv.remove_keys(ENV, ["A", "B"]) == "# comment\n\nPROJECT_NAME=x\nPLATFORM=linux/amd64\n"


def test_dotenv_remove_missing_key_is_stale():
    with pytest.raises(StaleManifestError):
        dotenv.remove_keys(ENV, ["A", "MISSING"])


MAKEFILE = (
    ".PHONY: build lint \\\n\tdb help\n\n"
    "build: ## build\n\techo build\n\n"
    ".PHONY: flags\nflags: ## flags\n\techo flags \\\n\t\t--more\n\n"
    "db: ## db\n\techo db\n\n"
    "VAR := value\n"
    "help: ## help\n\techo help"
)


def test_makefile_remove_target_with_own_phony_line():
    result = makefile.remove_targets(MAKEFILE, ["flags"])
    assert "flags" not in result
    assert "build: ## build\n\techo build\n\ndb: ## db" in result
    assert result.endswith("echo help\n")


def test_makefile_remove_target_from_multi_phony_continuation():
    result = makefile.remove_targets(MAKEFILE, ["db"])
    assert "db:" not in result
    assert ".PHONY: build lint \\\n\thelp\n" in result


def test_makefile_remove_target_listed_on_first_phony_line():
    result = makefile.remove_targets(MAKEFILE, ["build"])
    assert "build:" not in result
    assert result.startswith(".PHONY: lint \\\n\tdb help\n")


def test_makefile_does_not_treat_assignment_as_target():
    with pytest.raises(StaleManifestError, match="VAR"):
        makefile.remove_targets(MAKEFILE, ["VAR"])


def test_makefile_missing_target_is_stale():
    with pytest.raises(StaleManifestError, match="nope"):
        makefile.remove_targets(MAKEFILE, ["nope"])


PROJECT = '{"name": "x", "sourceRoot": "a", "targets": {"lint": {"options": {"cwd": "a"}}, "t": {"options": {}}}}'


def test_json_set_with_wildcard_and_plain_path():
    result = json_edit.set_paths(PROJECT, {"sourceRoot": "b", "targets.*.options.cwd": "b"})
    assert '"sourceRoot": "b"' in result
    assert result.count('"cwd": "b"') == 1
    assert result.endswith("}\n")


def test_json_set_missing_path_is_stale():
    with pytest.raises(StaleManifestError, match="targets.\\*.options.missing"):
        json_edit.set_paths(PROJECT, {"targets.*.options.missing": "b"})


def test_json_set_wildcard_over_list_and_scalars():
    assert json_edit.set_paths('{"a": [{"b": 1}, {"b": 2}]}', {"a.*.b": "x"}).count('"x"') == 2
    with pytest.raises(StaleManifestError):
        json_edit.set_paths('{"a": 1}', {"a.*.b": "x"})


def test_json_set_rejects_trailing_wildcard_and_invalid_json():
    with pytest.raises(StaleManifestError, match="last path segment"):
        json_edit.set_paths(PROJECT, {"targets.*": "x"})
    with pytest.raises(StaleManifestError, match="invalid JSON"):
        json_edit.set_paths("{", {"a": "b"})


def test_text_replace_and_remove_lines():
    assert text.replace_literal("a -f x -f y", "-f x ", "") == "a -f y"
    assert text.remove_matching_lines("keep\ndrop me\nkeep\n", r"^drop") == "keep\nkeep\n"


def test_text_misses_are_stale():
    with pytest.raises(StaleManifestError):
        text.replace_literal("abc", "zzz", "")
    with pytest.raises(StaleManifestError):
        text.remove_matching_lines("abc\n", r"^zzz")
