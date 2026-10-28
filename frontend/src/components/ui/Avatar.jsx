// src/components/ui/Avatar.jsx
// <Avatar name="Sara Mitchell" size={36} />
// Shows initials on a color picked from the name, so the same person always gets the same color.

import { getInitials } from "../../utils/formatters";
import { fontWeights } from "../../styles/theme";

const palette = [
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#E0F2FE", text: "#0369A1" },
  { bg: "#DCFCE7", text: "#15803D" },
  { bg: "#FEF3C7", text: "#B45309" },
  { bg: "#FCE7F3", text: "#BE185D" },
  { bg: "#F3E8FF", text: "#7E22CE" },
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