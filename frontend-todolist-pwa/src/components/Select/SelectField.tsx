import "./SelectField.css";

type Props = {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
};

export default function SelectField({ value, onChange, options }: Props) {
  return (
    <select
      className="Select"
      value={value.toString()} // On force en string pour le HTML
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value.toString()} value={opt.value.toString()}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}