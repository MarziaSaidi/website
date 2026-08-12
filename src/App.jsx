import { useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollProgress from "./components/layout/ScrollProgress";
import ChatWidget from "./components/ChatWidget";
import Hero from "./sections/Hero";
import About from "./sections/About";
import FeaturedProjects from "./sections/FeaturedProjects";
import CaseStudies from "./sections/CaseStudies";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import HowIWork from "./sections/HowIWork";
import Contact from "./sections/Contact";
import CaseStudySurvue from "./pages/CaseStudySurvue";
import CaseStudyRelay from "./pages/CaseStudyRelay";
import { useHashRoute } from "./hooks/useHashRoute";

function MainSite() {
  // When returning from a sub-page via an anchor hash (e.g. "#experience"),
  // scroll to that section once the main site mounts.
  useEffect(() => {
    const h = window.location.hash;
    if (h && h.length > 1 && !h.startsWith("#/")) {
      document.getElementById(h.slice(1))?.scrollIntoView();
    }
  }, []);

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
        <CaseStudies />
        <About />
        <FeaturedProjects />
        <Experience />
        <Projects />
        <Skills />
        <HowIWork />
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
