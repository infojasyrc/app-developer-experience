"""`python -m ade_core` — driven through Make inside ADE (see the package Makefile)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from ade_core import __version__
from ade_core.application.combinations import discover_templates, github_matrix, validate
from ade_core.application.render import render_template
from ade_core.domain.errors import AdeCoreError, ParameterError


def _pairs(items: list[str], flag: str) -> dict[str, str]:
    result = {}
    for item in items:
        key, sep, value = item.partition("=")
        if not sep or not key:
            raise ParameterError(f"{flag} expects key=value, got '{item}'")
        result[key] = value
    return result


def _cmd_render(args: argparse.Namespace) -> int:
    params = {"name": args.name, **_pairs(args.param, "--param")}
    result = render_template(Path(args.template), Path(args.out), params, _pairs(args.feature, "--feature"))
    features = " ".join(f"{k}={v}" for k, v in result.features.items())
    print(f"Rendered {result.artifact} as '{result.parameters['name']}' into {result.out_dir} ({result.files} files)")
    print(f"Features: {features}")
    if result.next_steps:
        print("Next steps (run from the rendered directory):")
        for step in result.next_steps:
            print(f"  {step}")
    return 0


def _cmd_validate(args: argparse.Namespace) -> int:
    dirs = [Path(d) for d in args.templates] or list(discover_templates(Path(args.repo)))
    if not dirs:
        print("No template.yaml found", file=sys.stderr)
        return 1
    failures = validate(dirs)
    for failure in failures:
        print(f"FAIL {failure}", file=sys.stderr)
    print(f"Validated {len(dirs)} manifest(s): {'FAILED' if failures else 'OK'}")
    return 1 if failures else 0


def _cmd_combinations(args: argparse.Namespace) -> int:
    print(json.dumps(github_matrix(Path(args.repo), args.packages)))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="ade_core", description="ADE core engine")
    parser.add_argument("--version", action="version", version=f"ade-core {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    render = sub.add_parser("render", help="render one template into a new directory")
    render.add_argument("template", help="template directory containing template.yaml")
    render.add_argument("--out", required=True, help="output directory (must be empty or missing)")
    render.add_argument("--name", required=True, help="new project name (kebab-case)")
    render.add_argument("--feature", action="append", default=[], metavar="KEY=VALUE")
    render.add_argument("--param", action="append", default=[], metavar="KEY=VALUE")
    render.set_defaults(func=_cmd_render)

    check = sub.add_parser("validate", help="render every feature combination of the manifests")
    check.add_argument("templates", nargs="*", help="template directories (default: backend/* in --repo)")
    check.add_argument("--repo", default=".", help="ADE repository root")
    check.set_defaults(func=_cmd_validate)

    combos = sub.add_parser("combinations", help="print the GitHub Actions matrix of feature combinations")
    combos.add_argument("--repo", default=".", help="ADE repository root")
    combos.add_argument("--packages", default="", help="changed package keys; empty means every template")
    combos.set_defaults(func=_cmd_combinations)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except AdeCoreError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
