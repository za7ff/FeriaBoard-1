import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertCommentSchema, type InsertComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CommentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertComment>({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: {
      name: "",
      email: "",
      content: "",
    },
  });

  const createComment = useMutation({
    mutationFn: async (data: InsertComment) => {
      const response = await apiRequest("POST", "/api/comments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Submitted",
        description: "Thank you! Your comment will be reviewed before being published.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertComment) => {
    createComment.mutate(data);
  };

  return (
    <section id="contact" className="py-16 px-6">
      <div className="max-w-2xl mx-auto animate-slide-up">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-luxury-gold">
          Share Your Thoughts
        </h2>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-luxury-charcoal rounded-2xl p-8 shadow-2xl border border-luxury-soft-gray"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-gray-300">Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your name"
                      className="bg-black border-luxury-soft-gray text-white placeholder-gray-500 focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@email.com"
                      className="bg-black border-luxury-soft-gray text-white placeholder-gray-500 focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel className="text-gray-300">Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Share your experience or feedback..."
                      className="bg-black border-luxury-soft-gray text-white placeholder-gray-500 focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold resize-none"
                      data-testid="textarea-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createComment.isPending}
              className="w-full bg-luxury-gold text-black font-semibold hover:bg-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-lg"
              data-testid="button-submit"
            >
              {createComment.isPending ? "Submitting..." : "Submit Comment"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
