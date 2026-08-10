import { useState } from "react";
import SectionHeading from "../components/ui/SectionHeading";
import Card from "../components/ui/Card";
import CsvValidator from "./projects/CsvValidator";
import MauiSimulator from "./projects/MauiSimulator";

const TABS = [
  { id: "csv", label: "CSV Pipeline Validator" },
  { id: "maui", label: ".NET MAUI Settings" },
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState("csv");

  return (
    <section id="work" aria-labelledby="projects-heading" className="relative py-24 md:py-32">
      <div id="projects" className="relative max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          index="05"
          eyebrow="Selected Work"
          title="A closer look at how I build"
          description="Working demonstrations of specific technical solutions I’ve implemented in past roles â a data validation pipeline and a cross-platform settings module."
          className="mb-14"
        />

        <div role="tablist" aria-label="Selected work demos" className="flex gap-8 border-b border-border mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-4 text-sm tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                activeTab === tab.id ? "text-text" : "text-text-secondary hover:text-text"
              }`}
            >
              {tab.label}
              <span
                className={`absolute left-0 -bottom-px h-px w-full bg-gold transition-transform duration-300 origin-left ${
                  activeTab === tab.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        <Card
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="p-6 md:p-10"
        >
          {activeTab === "csv" ? <CsvValidator /> : <MauiSimulator />}
        </Card>
      </div>
    </section>
  );
}
