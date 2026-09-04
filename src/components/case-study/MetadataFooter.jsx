// Direct port of aDrive's own closing card: the write-up treated as a
// spec'd object, not just prose — real figures about the page itself
// (word count, read time), not decoration. Kept as a plain <dl>, same as
// the reference: label + mono tabular value, 2-up on mobile, 3-up up.
export default function MetadataFooter({ fields }) {
  return (
    <footer className="mt-20 bg-surface border border-border rounded-xl p-5 md:p-6">
      <p className="font-display font-semibold text-sm text-text mb-5">Metadata</p>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <dt className="font-sans font-semibold text-sm text-text">{label}</dt>
            <dd className="font-mono tabular-nums text-sm text-text-secondary">{value}</dd>
          </div>
        ))}
      </dl>
    </footer>
  );
}
