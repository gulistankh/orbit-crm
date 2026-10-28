// src/components/activity/NoteForm.jsx
// Form to log a note, call, email or meeting on a contact.
// <NoteForm onSubmit={({ type, content }) => ...} />
// onSubmit should return something truthy when the save worked.

import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { activityTypes } from "../../data/mock";
import { spacing } from "../../styles/theme";

const placeholders = {
  note: "Write a note...",
  call: "What was discussed on the call?",
  email: "Summarize the email...",
  meeting: "What came out of the meeting?",
};

const styles = {
  form: { display: "flex", flexDirection: "column", gap: spacing.md },
  types: { display: "flex", flexWrap: "wrap", gap: spacing.sm },
  actions: { display: "flex", justifyContent: "flex-end" },
};

export default function NoteForm({ onSubmit }) {
  const [type, setType] = useState("note");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const text = content.trim();
    if (!text) {
      setError("Write something first.");
      return;
    }

    const saved = await onSubmit({ type, content: text });
    if (saved) {
      setContent("");
      setError("");
    }
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.types}>
        {activityTypes.map((item) => (
          <Button
            key={item.key}
            size="sm"
            variant={type === item.key ? "primary" : "secondary"}
            onClick={() => setType(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Input
        multiline
        rows={3}
        aria-label="Activity details"
        placeholder={placeholders[type]}
        value={content}
        maxLength={2000}
        error={error}
        onChange={(event) => {
          setContent(event.target.value);
          if (error) setError("");
        }}
      />

      <div style={styles.actions}>
        <Button type="submit">Add to log</Button>
      </div>
    </form>
  );
}