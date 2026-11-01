// src/components/ui/Avatar.jsx
// <Avatar name="Sara Mitchell" size={36} />
// Shows initials on a color picked from the name, so the same person always gets the same color.

import { getInitials } from "../../utils/formatters";
import { fontWeights } from "../../styles/theme";

const palette = [
  { bg: "#DDF0EC", text: "#0F766E" },
  { bg: "#E4EEFB", text: "#1D4ED8" },
  { bg: "#E1F3E6", text: "#15803D" },
  { bg: "#FDF0DC", text: "#B45309" },
  { bg: "#FCE7EF", text: "#BE185D" },
  { bg: "#EDE7FB", text: "#6D28D9" },
];

function pickColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function Avatar({ name = "", size = 32 }) {
  const color = pickColor(name);

  const style = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: "50%",
    backgroundColor: color.bg,
    color: color.text,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: Math.round(size * 0.38),
    fontWeight: fontWeights.semibold,
    userSelect: "none",
  };

  return <span style={style}>{getInitials(name)}</span>;
}