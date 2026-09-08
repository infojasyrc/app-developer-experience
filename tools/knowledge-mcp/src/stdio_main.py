from knowledge.bootstrap import load_store
from mcp_server import build_mcp


def main() -> None:
    store = load_store()
    mcp = build_mcp(store)
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
