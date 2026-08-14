import { useState } from "react";

export default function MauiSimulator() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [textScale, setTextScale] = useState(100);
  const [syncMode, setSyncMode] = useState("auto");

  const scale = textScale / 100;
  const screenTheme = dark
    ? { bg: "#2D2D2A", text: "#F7F2E9", sub: "#B8B2A6", card: "#3a3a35" }
    : { bg: "#FBF8F2", text: "#2D2D2A", sub: "#6B655C", card: "#F7F2E9" };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="flex flex-col gap-5">
        <h3 className="font-serif text-2xl text-text">.NET MAUI Settings Simulator</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          A responsive mobile component simulation replicating the settings
          preferences page built for Survue. Test system theme hooks and UI
          overrides.
        </p>
        <ul className="flex flex-col gap-2 text-sm text-text-secondary">
          <li className="pl-4 relative before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-bronze">
            Theme persistence: system defaults vs. custom override.
          </li>
          <li className="pl-4 relative before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-bronze">
            Cross-platform layout compliance matching MAUI’s XML layouts.
          </li>
          <li className="pl-4 relative before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-bronze">
            Smooth, restrained visual states.
          </li>
        </ul>
      </div>

      <div className="flex justify-center">
        <div className="w-[280px] rounded-[2rem] border border-border bg-paper p-3 shadow-soft-lg">
          <div
            className="rounded-[1.5rem] overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: screenTheme.bg }}
          >
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ color: screenTheme.text }}
            >
              <span aria-hidden="true">&larr;</span>
              <h5 className="font-sans" style={{ fontSize: `${0.95 * scale}rem` }}>
                App Settings
              </h5>
              <span aria-hidden="true">&#8942;</span>
            </div>

            <div className="px-4 pb-6 flex flex-col gap-5">
              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: screenTheme.sub }}
                >
                  Theme Options
                </p>

                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span style={{ color: screenTheme.text, fontSize: `${0.85 * scale}rem` }}>
                      Dark Theme Override
                    </span>
                    <span style={{ color: screenTheme.sub, fontSize: `${0.7 * scale}rem` }}>
                      Pin dark styles in app
                    </span>
                  </div>
                  <Toggle checked={dark} onChange={setDark} label="Dark theme override" />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span style={{ color: screenTheme.text, fontSize: `${0.85 * scale}rem` }}>
                      Push Notifications
                    </span>
                    <span style={{ color: screenTheme.sub, fontSize: `${0.7 * scale}rem` }}>
                      Alerts for task completion
                    </span>
                  </div>
                  <Toggle checked={notifications} onChange={setNotifications} label="Push notifications" />
                </div>
              </div>

              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: screenTheme.sub }}
                >
                  Preferences
                </p>

                <div className="flex flex-col gap-1 py-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: screenTheme.text, fontSize: `${0.85 * scale}rem` }}>
                      Text Scale
                    </span>
                    <span style={{ color: screenTheme.sub, fontSize: `${0.8 * scale}rem` }}>
                      {textScale}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={textScale}
                    onChange={(e) => setTextScale(Number(e.target.value))}
                    aria-label="Text scale"
                    className="w-full accent-[#C59B53]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span style={{ color: screenTheme.text, fontSize: `${0.85 * scale}rem` }}>
                      Data Sync Mode
                    </span>
                    <span style={{ color: screenTheme.sub, fontSize: `${0.7 * scale}rem` }}>
                      Google Contacts connection
                    </span>
                  </div>
                  <select
                    value={syncMode}
                    onChange={(e) => setSyncMode(e.target.value)}
                    aria-label="Data sync mode"
                    className="text-xs rounded-md border px-2 py-1 bg-transparent"
                    style={{ color: screenTheme.text, borderColor: screenTheme.sub }}
                  >
                    <option value="auto">Automatic</option>
                    <option value="wifi">Wi-Fi Only</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: screenTheme.sub }}
                >
                  Connection Status
                </p>
                <div
                  className="flex items-center gap-3 rounded-md px-3 py-3"
                  style={{ backgroundColor: screenTheme.card }}
                >
                  <span className="w-2 h-2 rounded-full bg-accent-secondary" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span style={{ color: screenTheme.text, fontSize: `${0.75 * scale}rem` }}>
                      Synced with Google API
                    </span>
                    <span style={{ color: screenTheme.sub, fontSize: `${0.65 * scale}rem` }}>
                      Last sync: 2 mins ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-paper transition-transform duration-300 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
