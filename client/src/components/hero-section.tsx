export default function HeroSection() {
  return (
    <section id="about" className="relative py-24 px-6 text-center animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-b from-luxury-charcoal/20 to-black"></div>
      
      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-luxury-gold tracking-wider">
          Feria
        </h1>
        <p className="text-xl md:text-2xl font-light text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
          Welcome to my personal page. I appreciate your feedback and comments about your experience with me.
        </p>
        <div className="w-24 h-1 bg-luxury-gold mx-auto"></div>
      </div>
    </section>
  );
}
