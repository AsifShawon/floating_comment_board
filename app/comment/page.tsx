"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquarePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const PRESET_COMMENTS = [
  "Great experience! Would definitely recommend.",
  "Good service but room for improvement.",
  "Average experience, nothing special.",
  "Below expectations, needs work.",
  "Very disappointing experience.",
];

const EMOJI_RATINGS = [
  { value: "5", label: "😄 Very Good" },
  { value: "4", label: "🙂 Good" },
  { value: "3", label: "😐 Neutral" },
  { value: "2", label: "🙁 Poor" },
  { value: "1", label: "😞 Disappointed" },
];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  comment: z.string().min(1, "Please select a comment"),
  rating: z.string().min(1, "Please select a rating"),
});

export default function CommentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      comment: "",
      rating: "",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      const emojiRating = parseInt(values.rating);
      
      const { error } = await supabase
        .from('comments')
        .insert([{
          name: values.name,
          comment: values.comment,
          emoji: emojiRating,
          created_at: new Date().toISOString()
        }]);
  
      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
        return;
      }
  
      toast({
        title: "Success!",
        description: "Your feedback has been submitted.",
        className: "animate-in slide-in-from-right-8 fade-in duration-500" // Added animation
      });
  
      form.reset();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="w-6 h-6" />
            <span>Share Your Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {EMOJI_RATINGS.map((rating) => (
                          <FormItem
                            key={rating.value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={rating.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {rating.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Comment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a comment..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRESET_COMMENTS.map((comment, index) => (
                          <SelectItem key={index} value={comment}>
                            {comment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
