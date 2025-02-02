"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { MessageCircle } from "lucide-react";
import Lottie from "lottie-react";

interface Comment {
  id: string;
  name: string;
  comment: string;
  emoji: number;
  created_at: string;
}

// Fallback static emoji if the animation is not loaded
const getStaticEmoji = (rating: number) => {
  const emojiMap: Record<number, string> = {
    5: "😄",
    4: "🙂",
    3: "😐",
    2: "🙁",
    1: "😞",
  };
  return emojiMap[rating] || "😐";
};

// Asynchronously fetch the Lottie JSON for a given emoji rating
const fetchEmojiAnimation = async (rating: number) => {
  const emojiMap: Record<number, string> = {
    5: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/lottie.json", // 😄
    4: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/lottie.json", // 🙂
    3: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f610/lottie.json", // 😐
    2: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f641/lottie.json", // 🙁
    1: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f61e/lottie.json", // 😞
  };

  const url = emojiMap[rating] || emojiMap[3];
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Lottie animation:", error);
    return null;
  }
};

export function CommentBoard() {
  const [comments, setComments] = useState<Comment[]>([]);
  // We'll store the Lottie animations indexed by emoji rating (as string keys)
  const [emojiAnimations, setEmojiAnimations] = useState<Record<string, any>>({});
  const maxDisplayComments = 12;

  useEffect(() => {
    const fetchCommentsAndEmojis = async () => {
      // Fetch comments from Supabase
      const { data } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(maxDisplayComments);

      if (data) {
        setComments(data);

        // Pre-fetch Lottie animations for each unique emoji rating found
        const emojiData: Record<string, any> = {};
        await Promise.all(
          data.map(async (comment: Comment) => {
            if (!emojiData[comment.emoji]) {
              const animation = await fetchEmojiAnimation(comment.emoji);
              emojiData[comment.emoji] = animation;
            }
          })
        );
        setEmojiAnimations(emojiData);
      }
    };

    fetchCommentsAndEmojis();

    // Subscribe to realtime updates from Supabase
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
            // Optionally, fetch its Lottie animation if not already in state
            if (!emojiAnimations[newComment.emoji]) {
              fetchEmojiAnimation(newComment.emoji).then((animation) => {
                setEmojiAnimations((prev) => ({
                  ...prev,
                  [newComment.emoji]: animation,
                }));
              });
            }
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
      {/* Background grid pattern for texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Dotted guideline across the middle */}
      <div className="absolute top-1/2 w-full border-t-2 border-dotted border-blue-400 dark:border-blue-600 opacity-50" />

      <div className="mt-20 relative w-full h-[600px] mx-auto">
        <AnimatePresence>
          {comments.map((comment, index) => {
            // Group every four cards so they animate together, with a stagger between groups.
            const groupIndex = Math.floor(index / 4);

            return (
              <motion.div
                key={comment.id}
                initial={{ x: "100vw", opacity: 0, scale: 0.8 }}
                animate={{ x: "-100vw", opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  x: {
                    duration: 30, // Adjust the duration to control speed
                    repeat: Infinity,
                    ease: "linear",
                    delay: groupIndex * 10, // Groups are staggered by 10 seconds each
                  },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 },
                }}
                className="absolute"
                style={{
                  // Vertically offset cards in each group by 80px
                  top: `calc(30% + ${(index % 4) * 130}px)`,
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
                    {/* Render the animated emoji if available, else a static fallback */}
                    {emojiAnimations[comment.emoji] ? (
                      <Lottie
                        animationData={emojiAnimations[comment.emoji]}
                        style={{ width: 32, height: 32 }}
                        loop
                        autoplay
                      />
                    ) : (
                      <span className="text-xl">{getStaticEmoji(comment.emoji)}</span>
                    )}
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
