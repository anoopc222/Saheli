"use client";

import { useState } from "react";

export function TagChipInput({
  initialTags,
  suggestions,
}: {
  initialTags: string[];
  suggestions: string[];
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <input type="hidden" name="tags" value={tags.join(",")} />
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-accent hover:text-accent-dark"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          list="tag-suggestions"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => addTag(draft)}
          placeholder="Type a tag, press Enter"
          className="min-w-[8rem] flex-1 rounded-full border border-line bg-paper-raised px-3 py-1 text-xs outline-none focus:border-accent"
        />
      </div>
      <datalist id="tag-suggestions">
        {suggestions.map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>
      <p className="mt-1.5 text-xs text-ink-muted">
        For internal mapping only — never shown to customers.
      </p>
    </div>
  );
}
