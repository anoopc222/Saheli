"use client";

export function VisibilityToggle({
  id,
  checked,
  action,
  label,
  field = "show_on_menu",
}: {
  id: string;
  checked: boolean;
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  field?: string;
}) {
  return (
    <form action={action} className="shrink-0">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name={field} value={(!checked).toString()} />
      <button
        type="submit"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`relative inline-block h-5 w-9 shrink-0 rounded-full p-0 transition-colors ${
          checked ? "bg-accent" : "bg-line"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </form>
  );
}
