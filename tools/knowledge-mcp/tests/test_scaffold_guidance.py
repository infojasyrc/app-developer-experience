from knowledge.scaffold import known_component_types, scaffold_guidance
from mcp_server import build_mcp


def test_scaffold_guidance_nestjs_rest_uses_path_alias():
    result = scaffold_guidance("nestjs-rest")
    assert result["ok"] is True
    assert result["is_template"] is True
    assert result["path_alias"] == "NESTJS_REST"
    assert result["path"] == "backend/nestjs-rest-tpl/"
    assert result["must_keep"] == ["Makefile", "Dockerfile"]
    assert "build-dev" in result["lifecycle"]["required"]
    assert "install-dependencies" in result["lifecycle"]["required"]
    how = " ".join(result["how"]).lower()
    assert "make help" in how
    assert "host" in how or "docker" in how
    assert "create-nodejs" not in how


def test_scaffold_guidance_alias_fastapi():
    result = scaffold_guidance("MS_FASTAPI")
    assert result["ok"] is True
    assert result["component_type"] == "fastapi-rest"
    assert result["path_alias"] == "MS_FASTAPI"


def test_scaffold_guidance_unknown_type():
    result = scaffold_guidance("android-native")
    assert result["ok"] is False
    assert "Unknown component_type" in result["error"]
    assert "nestjs-rest" in result["known_types"]


def test_scaffold_guidance_conference_manager_is_not_a_template():
    result = scaffold_guidance("conference-manager")
    assert result["ok"] is False
    assert result["is_template"] is False
    assert "not a bootstrap template" in result["error"]
    assert "NESTJS_REST" in result["error"] or "MS_FASTAPI" in result["error"]


def test_scaffold_guidance_cm_alias_rejected():
    result = scaffold_guidance("cm")
    assert result["ok"] is False
    assert result["is_template"] is False


def test_known_component_types_are_templates_only():
    types = known_component_types()
    assert "nestjs-rest" in types
    assert "conference-manager" not in types


def test_scaffold_guidance_terraform_aws_is_host_cli():
    result = scaffold_guidance("terraform-aws")
    assert result["ok"] is True
    assert result["path_alias"] == "TERRAFORM_AWS"
    assert result["must_keep"] == ["Makefile"]
    assert "Dockerfile" not in result["must_keep"]
    assert "init" in result["lifecycle"]["required"]
    assert "plan" in result["lifecycle"]["required"]
    assert "build-dev" not in result["lifecycle"]["required"]
    assert result["lifecycle"]["host_forbidden"] == []
    how = " ".join(result["how"]).lower()
    assert "makefile" in how
    assert "dockerfile" in how
    assert "terraform" in how
    assert "docker" not in how or "do not add a dockerfile" in how


def test_scaffold_guidance_terraform_azure_does_not_require_dockerfile():
    result = scaffold_guidance("terraform-azure")
    assert result["ok"] is True
    assert result["must_keep"] == ["Makefile"]
    assert "Dockerfile" not in result["must_keep"]


def test_mcp_exposes_scaffold_guidance(knowledge_store):
    mcp = build_mcp(knowledge_store)
    result = scaffold_guidance("nestjs-gql")
    assert result["path_alias"] == "NESTJS_GQL"
    assert callable(mcp.list_convention_uris)
