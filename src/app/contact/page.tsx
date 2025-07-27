export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <h1 className="neue-haas-grotesk-display text-4xl text-primary mb-8">
            Contact
          </h1>

          {/* Contact Form */}
          <form data-testid="contact-form" className="space-y-6 max-w-2xl">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full p-3 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <div
                data-testid="name-error"
                className="text-red-500 text-sm mt-1 hidden"
              >
                Name is required
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full p-3 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <div
                data-testid="email-error"
                className="text-red-500 text-sm mt-1 hidden"
              >
                Valid email is required
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-2"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full p-3 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full p-3 border border-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <div
                data-testid="message-error"
                className="text-red-500 text-sm mt-1 hidden"
              >
                Message is required
              </div>
            </div>

            <button
              type="submit"
              data-testid="submit-button"
              className="bg-accent text-background px-6 py-3 border border-accent hover:bg-background hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
