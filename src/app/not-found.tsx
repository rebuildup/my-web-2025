import Link from 'next/link';
import { 
  AlertCircle, 
  Home, 
  Search, 
  ArrowLeft, 
  Compass,
  Star,
  Book,
  Tool,
  FileText,
  Mail
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <AlertCircle size={120} className="text-primary mx-auto mb-4" />
          <div className="neue-haas-grotesk-display text-8xl md:text-9xl text-primary opacity-20">
            404
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-6">
            Page Not Found
          </h1>
          <p className="noto-sans-jp text-lg md:text-xl text-foreground/80 mb-4">
            お探しのページは見つかりませんでした
          </p>
          <p className="noto-sans-jp text-foreground/60 max-w-2xl mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's help you find what you're looking for.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Home size={32} className="text-primary mx-auto mb-3" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Home
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Go back to the main page
              </p>
            </Link>

            <Link
              href="/portfolio"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Star size={32} className="text-primary mx-auto mb-3" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Portfolio
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Check out my work and projects
              </p>
            </Link>

            <Link
              href="/tools"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Tool size={32} className="text-primary mx-auto mb-3" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Tools
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Explore interactive tools
              </p>
            </Link>

            <Link
              href="/workshop"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Book size={32} className="text-primary mx-auto mb-3" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Workshop
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Read blog posts and tutorials
              </p>
            </Link>

            <Link
              href="/about"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <FileText size={32} className="text-primary mx-auto mb-3" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                About
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Learn more about me
              </p>
            </Link>

            <Link
              href="/contact"
              className="group p-6 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
            >
              <Mail size={32} className="text-primary mx-auto mb-3" />
              <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary">
                Contact
              </h3>
              <p className="noto-sans-jp text-sm text-foreground/70">
                Get in touch with me
              </p>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Search size={20} className="text-foreground/60" />
              <span className="neue-haas-grotesk-display text-lg text-foreground">
                Search the site
              </span>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Compass size={20} />
              <span>Go to Search</span>
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 px-6 py-3 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-foreground/20">
          <p className="noto-sans-jp text-sm text-foreground/50">
            If you think this is a mistake, please{' '}
            <Link href="/contact" className="text-primary hover:text-primary/80 underline">
              contact me
            </Link>
            {' '}and let me know about the broken link.
          </p>
        </div>
      </div>
    </div>
  );
}