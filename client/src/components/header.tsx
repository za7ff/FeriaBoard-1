export default function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative z-10 bg-black/90 backdrop-blur-sm border-b border-luxury-charcoal">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-luxury-gold">Feria</div>
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => scrollToSection('about')}
              className="hover:text-luxury-gold transition-colors duration-300"
              data-testid="link-about"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="hover:text-luxury-gold transition-colors duration-300"
              data-testid="link-testimonials"
            >
              Testimonials
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="hover:text-luxury-gold transition-colors duration-300"
              data-testid="link-contact"
            >
              Contact
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
