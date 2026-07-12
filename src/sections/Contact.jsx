import { useState } from "react";
import SectionHeading from "../components/ui/SectionHeading";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Illustration from "../components/ui/Illustration";

const WEB3FORMS_ACCESS_KEY = "8eebed3f-f81a-4b38-92de-83f5c2d8b7c1";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.name.value;

    setStatus("loading");
    setFeedback("");

    try {
      const formData = new FormData(form);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setFeedback(`Thanks, ${name}! Your message has been sent successfully.`);
        form.reset();
      } else {
        setStatus("error");
        setFeedback(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setFeedback("Network error. Please try again later.");
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-24 md:py-32 bg-background-secondary/40">
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-start">
        <div className="flex flex-col gap-10">
          <SectionHeading
            index="06"
            eyebrow="Let's Connect"
            title="Start a conversation"
            description="Have an opening, a freelance project, or just want to discuss software engineering and design? Send a message below."
          />
          <Illustration
            src="/illustrations/pomegranate.png"
            alt="Hand-drawn pencil illustration of a pomegranate branch"
            className="max-w-sm"
          />
          <a
            href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            LinkedIn Profile
          </a>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
            <input type="hidden" name="subject" value="New message from your portfolio site" />
            <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="text-xs tracking-[0.15em] uppercase text-text-secondary">
                Your Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                placeholder="e.g. John Doe"
                className="w-full border-0 border-b border-border bg-transparent px-1 pb-2 pt-1 text-sm text-text placeholder:text-text-secondary/70 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="text-xs tracking-[0.15em] uppercase text-text-secondary">
                Email Address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="e.g. john@company.com"
                className="w-full border-0 border-b border-border bg-transparent px-1 pb-2 pt-1 text-sm text-text placeholder:text-text-secondary/70 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-msg" className="text-xs tracking-[0.15em] uppercase text-text-secondary">
                Message
              </label>
              <textarea
                id="contact-msg"
                name="message"
                required
                rows={5}
                placeholder="Hello Marzia, I'd like to talk about..."
                className="w-full border-0 border-b border-border bg-transparent px-1 pb-2 pt-1 text-sm text-text placeholder:text-text-secondary/70 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm resize-y"
              />
            </div>

            <Button as="button" type="submit" variant="primary" className="justify-center" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send Message"}
            </Button>

            <div aria-live="polite" className="min-h-[1.5rem]">
              {feedback && (
                <p className={`text-sm ${status === "success" ? "text-accent-secondary" : "text-bronze"}`}>
                  {feedback}
                </p>
              )}
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
