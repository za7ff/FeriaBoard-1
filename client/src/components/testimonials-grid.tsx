import { useQuery } from "@tanstack/react-query";
import { type Comment } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function TestimonialsGrid() {
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
  });

  if (isLoading) {
    return (
      <section id="testimonials" className="py-16 px-6 bg-luxury-charcoal/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16 text-luxury-gold">
            Client Testimonials
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-black rounded-xl p-6 shadow-xl border border-luxury-soft-gray animate-pulse"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="mr-4">
                    <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (comments.length === 0) {
    return (
      <section id="testimonials" className="py-16 px-6 bg-luxury-charcoal/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16 text-luxury-gold">
            Client Testimonials
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No testimonials yet. Be the first to share your experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-16 px-6 bg-luxury-charcoal/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16 text-luxury-gold">
          Client Testimonials
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-black rounded-xl p-6 shadow-xl border border-luxury-soft-gray hover:border-luxury-gold/50 transition-all duration-300 transform hover:-translate-y-1"
              data-testid={`testimonial-${comment.id}`}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center text-black font-bold text-lg">
                  {comment.name.charAt(0).toUpperCase()}
                </div>
                <div className="mr-4">
                  <h3 className="font-semibold text-lg text-white" data-testid={`text-author-${comment.id}`}>
                    {comment.name}
                  </h3>
                  <p className="text-gray-400 text-sm" data-testid={`text-date-${comment.id}`}>
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed" data-testid={`text-content-${comment.id}`}>
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
