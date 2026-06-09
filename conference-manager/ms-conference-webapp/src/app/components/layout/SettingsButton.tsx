"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import SettingsIcon from "@mui/icons-material/Settings";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { useThemeMode } from "@/app/lib/contexts/ThemeContext";

export function SettingsButton() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const { mode, toggleTheme } = useThemeMode();
  const open = Boolean(anchor);

  return (
    <>
      <Tooltip title="Settings" placement="right">
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="open settings"
          aria-expanded={open}
          aria-haspopup="true"
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: { sx: { borderRadius: 2, boxShadow: 3 } },
        }}
      >
        <Box sx={{ p: 2, minWidth: 180 }}>
          <Typography variant="subtitle2" gutterBottom>
            Appearance
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Light">
              <LightModeIcon
                fontSize="small"
                sx={{ color: "warning.main" }}
                aria-hidden="true"
              />
            </Tooltip>

            <Switch
              checked={mode === "dark"}
              onChange={toggleTheme}
              size="small"
              inputProps={{ "aria-label": "toggle dark mode", role: "switch" }}
            />

            <Tooltip title="Dark">
              <DarkModeIcon
                fontSize="small"
                sx={{ color: "primary.main" }}
                aria-hidden="true"
              />
            </Tooltip>

            <Typography
              variant="body2"
              sx={{ color: "text.secondary", ml: 0.5, minWidth: 32 }}
            >
              {mode === "dark" ? "Dark" : "Light"}
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
