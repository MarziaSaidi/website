import FooterSignature from "../FooterSignature";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-10 flex flex-col items-center text-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-text-secondary">
          <p>&copy; {year} Marzia Saidi</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
            >
              LinkedIn
            </a>
            <a
              href="mailto:marzia.saidi67@gmail.com"
              className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
            >
              Email
            </a>
          </div>
        </div>
      </div>

      <FooterSignature />
    </footer>
  );
}
