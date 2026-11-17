interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ checked, onChange }: Props) {
  return (
    <button
      className={checked ? "toggle on" : "toggle"}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      type="button"
    >
      <span className="toggle-knob" />
    </button>
  );
}