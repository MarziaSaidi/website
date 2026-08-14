import { useState } from "react";
import { SAMPLE_CSV, validateCsv } from "../../utils/csv";
import Button from "../../components/ui/Button";

function AddressCell({ row }) {
  if (!row.address) return <td className="px-3 py-3 text-text-secondary">—</td>;

  const { parsedAddress, addrErrors } = row;
  const line = (label, value, error) => {
    if (!value && !error) return null;
    return (
      <span key={label} className="block">
        <strong className="text-text">{label}:</strong> {value || "—"}
        {error && <span className="text-accent-secondary ml-1">({error})</span>}
      </span>
    );
  };

  return (
    <td className="px-3 py-3 text-xs leading-relaxed text-text-secondary min-w-[180px]">
      {line("Street", parsedAddress.street)}
      {parsedAddress.unit && line("Unit", parsedAddress.unit)}
      {line("City", parsedAddress.city, addrErrors.city)}
      {line("State", parsedAddress.state, addrErrors.state)}
      {line("ZIP", parsedAddress.zip, addrErrors.zip)}
    </td>
  );
}

function Cell({ value, error }) {
  return (
    <td className="px-3 py-3 text-text-secondary">
      {value || "—"}
      {error && <span className="block text-xs text-accent-secondary">{error}</span>}
    </td>
  );
}

export default function CsvValidator() {
  const [input, setInput] = useState(SAMPLE_CSV);
  const [rows, setRows] = useState(null);

  const runValidation = () => {
    if (!input.trim()) {
      setRows([]);
      return;
    }
    setRows(validateCsv(input));
  };

  const loadSample = () => {
    setInput(SAMPLE_CSV);
    setRows(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 min-w-0">
      <div className="flex flex-col gap-5 min-w-0">
        <h3 className="font-serif text-2xl text-text">CSV Data Pipeline</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          Paste comma-separated values to test the real-time validation behind
          my Quill &amp; Pigeon "Import Contacts" pipeline. Columns:{" "}
          <code className="text-accent">Nickname</code>,{" "}
          <code className="text-accent">First Name</code>,{" "}
          <code className="text-accent">Last Name</code> (all required), then
          optional <code className="text-accent">Address</code>,{" "}
          <code className="text-accent">Birthday</code> and{" "}
          <code className="text-accent">Anniversary</code> as{" "}
          <code className="text-accent">mm-dd</code>. Wrap addresses in quotes
          since they contain commas.
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="csv-input" className="text-xs tracking-[0.15em] uppercase text-text-secondary">
            CSV Input
          </label>
          <textarea
            id="csv-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={7}
            className="w-full rounded-md border border-border bg-paper px-4 py-3 text-sm font-mono text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze resize-y"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button as="button" type="button" variant="primary" onClick={runValidation}>
            Run Schema Validation
          </Button>
          <Button as="button" type="button" variant="secondary" onClick={loadSample}>
            Load Sample Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 min-w-0">
        <h4 className="text-xs tracking-[0.15em] uppercase text-text-secondary">
          Pipeline Feedback Output
        </h4>
        <div className="border border-border rounded-lg overflow-auto max-h-[420px] bg-paper">
          {!rows && (
            <p className="p-6 text-sm text-text-secondary">
              Click "Run Schema Validation" to parse the CSV input.
            </p>
          )}
          {rows && rows.length === 0 && (
            <p className="p-6 text-sm text-accent-secondary">
              Please enter CSV data before validating.
            </p>
          )}
          {rows && rows.length > 0 && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Row", "Nickname", "First", "Last", "Address", "Birthday", "Anniv.", "Status"].map(
                    (h) => (
                      <th key={h} className="px-3 py-2 text-xs tracking-wide uppercase text-text-secondary font-normal">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.rowNum}
                    className={`row-stagger border-b border-border last:border-0 ${
                      row.isValid ? "" : "bg-gold/5"
                    }`}
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <td className="px-3 py-3 text-text font-medium">{row.rowNum}</td>
                    <Cell value={row.nickname} error={row.errors.nickname} />
                    <Cell value={row.firstName} error={row.errors.firstName} />
                    <Cell value={row.lastName} error={row.errors.lastName} />
                    <AddressCell row={row} />
                    <Cell value={row.birthday} error={row.errors.birthday} />
                    <Cell value={row.anniversary} error={row.errors.anniversary} />
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          row.isValid
                            ? "border-accent-secondary text-accent-secondary"
                            : "border-bronze text-label"
                        }`}
                      >
                        {row.isValid ? "Passed" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
