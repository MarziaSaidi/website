import { useEffect } from "react";
import SiteGrid from "./components/SiteGrid";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollProgress from "./components/layout/ScrollProgress";
import CustomCursor from "./components/CustomCursor";
import PixelTrail from "./components/PixelTrail";
import IntroLoader from "./components/IntroLoader";
import Hero from "./sections/Hero/Hero";
import FeaturedWork from "./sections/FeaturedWork";
import Experience from "./sections/Experience";
import About from "./sections/About/About";
import Contact from "./sections/Contact";
import CaseStudySurvue from "./pages/CaseStudySurvue";
import CaseStudyRelay from "./pages/CaseStudyRelay";
import CaseStudyGetCampus from "./pages/CaseStudyGetCampus";
import CaseStudyQalin from "./pages/CaseStudyQalin";
import CaseStudySupportIQ from "./pages/CaseStudySupportIQ";
import SimpleCaseStudy from "./pages/SimpleCaseStudy";
import { useHashRoute } from "./hooks/useHashRoute";

const PAGE_IDS = ["experience", "about", "contact"];

function routeToPageId(route) {
  const clean = route.replace(/^#\/?/, "");
  return PAGE_IDS.includes(clean) ? clean : "home";
}

// Shared chrome for every top-level page — the intro loader, skip link,
// scroll progress, custom cursor, pixel trail, nav, and footer were previously mounted
// once around the whole single-page site; now each route gets its own
// instance of this shell around just its own content.
function Shell({ pageId, children }) {
  return (
    <>
      <IntroLoader />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-background focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <CustomCursor />
      <PixelTrail />
      <Navbar active={pageId} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}

// Every top-level page resets scroll position on mount, matching the
// existing case-study pages' convention — otherwise navigating between
// routes preserves whatever scroll offset the previous page was at.
function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

function HomePage() {
  useScrollToTop();
  return (
    <Shell pageId="home">
      <Hero />
      <FeaturedWork />
    </Shell>
  );
}

function ExperiencePage() {
  useScrollToTop();
  return (
    <Shell pageId="experience">
      <Experience />
    </Shell>
  );
}

function AboutPage() {
  useScrollToTop();
  return (
    <Shell pageId="about">
      <About />
    </Shell>
  );
}

function ContactPage() {
  useScrollToTop();
  return (
    <Shell pageId="contact">
      <Contact />
    </Shell>
  );
}

const PAGES = {
  experience: ExperiencePage,
  about: AboutPage,
  contact: ContactPage,
  home: HomePage,
};

function Router() {
  const route = useHashRoute();

  if (route.startsWith("#/survue")) {
    return <CaseStudySurvue />;
  }

  if (route.startsWith("#/relay")) {
    return <CaseStudyRelay />;
  }

  if (route.startsWith("#/get-campus")) {
    return <CaseStudyGetCampus />;
  }

  if (route.startsWith("#/qalin")) {
    return <CaseStudyQalin />;
  }

  if (route.startsWith("#/supportiq")) {
    return <CaseStudySupportIQ />;
  }

  if (route.startsWith("#/quill-pigeon")) {
    return <SimpleCaseStudy projectId="quill-pigeon" />;
  }

  if (route.startsWith("#/wildwood")) {
    return <SimpleCaseStudy projectId="wildwood" />;
  }

  const Page = PAGES[routeToPageId(route)];
  return <Page />;
}

export default function App() {
  return (
    <>
      <SiteGrid />
      <Router />
    </>
  );
}
