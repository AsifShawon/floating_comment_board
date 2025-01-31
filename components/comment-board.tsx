"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { MessageCircle } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  comment: string;
  emoji: number;
  created_at: string;
}

const getEmojiByRating = (rating: number) => {
  switch (rating) {
    case 5:
      return "😄";
    case 4:
      return "🙂";
    case 3:
      return "😐";
    case 2:
      return "🙁";
    case 1:
      return "😞";
    default:
      return "😐";
  }
};

export function CommentBoard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const maxDisplayComments = 12;
  const cardWidth = 264;
  const cardSpacing = 2;
  const totalWidth = cardWidth + cardSpacing;

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(maxDisplayComments);

      if (data) setComments(data);
    };

    fetchComments();

    const channel = supabase
      .channel("public:comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
        },
        (payload) => {
          setComments((prevComments) => {
            const newComment = payload.new as Comment;
            return [newComment, ...prevComments].slice(0, maxDisplayComments);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="absolute top-1/2 w-full border-t-2 border-dotted border-blue-400 dark:border-blue-600 opacity-50" />

      <div className="mt-20 relative w-full h-[600px] mx-auto">
        <AnimatePresence>
          {comments.map((comment, index) => {
            const groupIndex = Math.floor(index / 4); // Grouping comments in sets of 4

            return (
              <motion.div
                key={comment.id}
                initial={{ x: "100vw", opacity: 0, scale: 0.8 }}
                animate={{ x: "-100vw", opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  x: {
                    duration: 30, // Speed of movement
                    repeat: Infinity, // Keep looping
                    ease: "linear",
                    delay: groupIndex * 10, // Stagger groups
                  },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 },
                }}
                className="absolute"
                style={{
                  top: `calc(50% + ${(index % 4) * 80}px)`, // Stack in groups of 4
                  left: "100vw",
                }}
              >
                <div className="bg-white dark:bg-blue-950 p-4 rounded-lg shadow-lg w-64 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                        {comment.name}
                      </h3>
                    </div>
                    <motion.div
  initial={{ scale: 0.5, rotate: -10 }}
  animate={{
    scale: [1, 1.4, 1],   // Bounce effect
    rotate: [-15, 15, -15], // Sway left-right
    y: [0, -10, 0],  // Move up and down
  }}
  transition={{
    duration: 1.5,   // Faster animation
    repeat: Infinity,
    repeatType: "reverse",
  }}
  className="text-xl"
>
  {getEmojiByRating(comment.emoji)}
</motion.div>

                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {comment.comment}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CommentBoard;
