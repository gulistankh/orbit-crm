// src/components/ui/ConfirmDialog.jsx
// <ConfirmDialog
//   open={Boolean(contactToDelete)}
//   title="Delete contact"
//   message="This will also delete its notes. This can't be undone."
//   onConfirm={...}
//   onCancel={...}
// />

import Modal from "./Modal";
import Button from "./Button";
import { colors, fontSizes } from "../../styles/theme";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width={420}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p
        style={{
          margin: 0,
          fontSize: fontSizes.md,
          color: colors.textSecondary,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
    </Modal>
  );
}