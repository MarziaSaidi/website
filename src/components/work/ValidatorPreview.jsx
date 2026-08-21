import { validateCsv } from "../../utils/csv";
import BrowserChrome from "./BrowserChrome";

// Real output from the actual validateCsv() logic behind the Quill &
// Pigeon import pipeline — three hand-picked sample rows, not fabricated
// pixels. A compact, honest stand-in for the real tool.
const SAMPLE = [
  'Mom,Jane,Doe,"23 Maine St, Apt 4, Lisbon, ME 04250",03-12,06-20',
  ',Mike,Jones,"42 Pigeon Ave, Austin, TX 73301",07-04,',
  "Sis,Emma,Stone,Just a street name,02-30,13-40",
].join("\n");

const rows = validateCsv(SAMPLE);

export default function ValidatorPreview() {
  return (
    <BrowserChrome url="quillpigeon.app/contacts/import">
      <div className="bg-background">
        <table className="w-full text-[0.65rem] sm:text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              {["Nickname", "First", "Last", "Status"].map((h) => (
                <th
                  key={h}
                  className={`px-1.5 py-1.5 sm:px-3 sm:py-2 text-[0.6rem] sm:text-[0.65rem] tracking-wide uppercase text-text-secondary font-normal ${
                    h === "Nickname" ? "hidden sm:table-cell" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowNum} className="border-b border-border last:border-0">
                <td className="hidden sm:table-cell px-3 py-2.5 text-text-secondary">{row.nickname || "—"}</td>
                <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5 text-text">{row.firstName}</td>
                <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5 text-text">{row.lastName}</td>
                <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                  <span
                    className={`inline-block text-[0.6rem] sm:text-[0.65rem] px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      row.isValid
                        ? "border-accent text-accent"
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
      </div>
    </BrowserChrome>
  );
}
