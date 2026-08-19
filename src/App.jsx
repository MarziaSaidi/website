import { useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollProgress from "./components/layout/ScrollProgress";
import ChatWidget from "./components/ChatWidget";
import Hero from "./sections/Hero";
import SelectedWork from "./sections/SelectedWork";
import Experience from "./sections/Experience";
import About from "./sections/About";
import Contact from "./sections/Contact";
import CaseStudySurvue from "./pages/CaseStudySurvue";
import CaseStudyRelay from "./pages/CaseStudyRelay";
import { useHashRoute } from "./hooks/useHashRoute";
import { useHashSync } from "./hooks/useHashSync";

function MainSite() {
  // When returning from a sub-page via an anchor hash (e.g. "#experience"),
  // scroll to that section once the main site mounts.
  useEffect(() => {
    const h = window.location.hash;
    if (h && h.length > 1 && !h.startsWith("#/")) {
      document.getElementById(h.slice(1))?.scrollIntoView();
    }
  }, []);

  // Keeps the hash matching whatever section is on screen as the user
  // scrolls, so a reload always lands where they actually were.
  useHashSync();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-background focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <SelectedWork />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default function App() {
  const route = useHashRoute();

  if (route.startsWith("#/survue")) {
    return <CaseStudySurvue />;
  }

  if (route.startsWith("#/relay")) {
    return <CaseStudyRelay />;
  }

  return <MainSite />;
}
