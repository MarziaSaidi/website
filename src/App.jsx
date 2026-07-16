import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./sections/Hero";
import About from "./sections/About";
import FeaturedProjects from "./sections/FeaturedProjects";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import HowIWork from "./sections/HowIWork";
import Contact from "./sections/Contact";

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-background focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <FeaturedProjects />
        <Experience />
        <Projects />
        <Skills />
        <HowIWork />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
