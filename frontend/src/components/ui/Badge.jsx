// src/components/ui/Badge.jsx
// <Badge tone="success">Paid</Badge>
// <Badge stage="negotiation">Negotiation</Badge>   (deal stage colors)
// <Badge status="customer">Customer</Badge>        (contact status colors)

import { colors, stageColors, radius, fontSizes, fontWeights } from "../../styles/theme";

const tones = {
  neutral: { bg: "#EFECE6", text: colors.textSecondary },
  primary: { bg: colors.primarySoft, text: colors.primary },
  success: { bg: colors.successSoft, text: colors.success },
  warning: { bg: colors.warningSoft, text: colors.warning },
  danger: { bg: colors.dangerSoft, text: colors.danger },
  info: { bg: colors.infoSoft, text: colors.info },
};
const statusTones = {
  lead: "info",
  active: "primary",
  customer: "success",
  inactive: "neutral",
};

export default function Badge({ children, tone = "neutral", stage, status }) {
  let bg;
  let text;
  let dot = null;

  if (stage && stageColors[stage]) {
    bg = stageColors[stage].bg;
    text = stageColors[stage].text;
    dot = stageColors[stage].dot;
  } else {
    const resolvedTone = status ? statusTones[status] || "neutral" : tone;
    bg = tones[resolvedTone].bg;
    text = tones[resolvedTone].text;
  }

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    borderRadius: radius.pill,
    backgroundColor: bg,
    color: text,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    whiteSpace: "nowrap",
  };

  return (
    <span style={style}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: dot,
          }}
        />
      )}
      {children}
    </span>
  );
}