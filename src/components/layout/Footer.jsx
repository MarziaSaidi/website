export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-accent text-background">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 flex flex-col items-center text-center gap-6">
        <span className="font-serif text-xl">Marzia Saidi</span>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-background/70">
          <p>&copy; {year} Marzia Saidi</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
            >
              LinkedIn
            </a>
            <a
              href="mailto:marzia.saidi67@gmail.com"
              className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
