import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import CommentForm from "@/components/comment-form";
import TestimonialsGrid from "@/components/testimonials-grid";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Header />
      <main>
        <HeroSection />
        <CommentForm />
        <TestimonialsGrid />
      </main>
      <Footer />
    </div>
  );
}
