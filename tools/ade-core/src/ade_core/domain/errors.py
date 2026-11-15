class AdeCoreError(Exception):
    """Base error for the ADE core engine."""


class ManifestError(AdeCoreError):
    """template.yaml is missing, unparseable or does not satisfy the manifest schema."""


class StaleManifestError(AdeCoreError):
    """A manifest transform no longer matches the template files (the manifest drifted)."""


class ParameterError(AdeCoreError):
    """Render parameters or feature values are invalid."""
