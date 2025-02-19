// components/CommentBoard.tsx
"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { preloadEmojiAnimations } from "@/lib/emojiHelpers";
import BoatAnimation from "./BoatAnimation";
import CommentCard from "./CommentCard";

interface Comment {
  id: string;
  name: string;
  comment: string;
  emoji: number;
  created_at: string;
}

const CommentBoardClient = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [emojiAnimations, setEmojiAnimations] = useState<Record<string, any>>({});
  const maxDisplayComments = 12;

  useEffect(() => {
    const fetchCommentsAndEmojis = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(maxDisplayComments);

      if (data) {
        setComments(data);
        const preloadedAnimations = await preloadEmojiAnimations();
        setEmojiAnimations(preloadedAnimations);
      }
    };

    fetchCommentsAndEmojis();

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
          const newComment = payload.new as Comment;
          setComments((prevComments) => {
            return [newComment, ...prevComments].slice(0, maxDisplayComments);
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-red-500 to-purple-900" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-yellow-200 blur-sm" />
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-b from-teal-400 to-blue-900">
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 bg-yellow-200 opacity-50"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: "rotate(-45deg)",
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-1/2 w-full">
        <svg viewBox="0 0 1440 320" className="w-full">
          <path
            fill="rgb(15 23 42)"
            d="M0,320L48,304C96,288,192,256,288,245.3C384,235,480,245,576,234.7C672,224,768,192,864,186.7C960,181,1056,203,1152,213.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Comments as Boats */}
      <div className="relative w-full h-full pt-[350px]">
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ x: "100vw", y: `${50 + index * 15}%` }}
              animate={{ x: "-100vw", y: `${50 + index * 15}%` }}
              exit={{ opacity: 0 }}
              transition={{
                x: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 2,
                },
              }}
              className="absolute"
            >
              <div className="relative">
                <BoatAnimation className="absolute -left-4 -top-20 w-[200px]" />
                <CommentCard
                  name={comment.name}
                  comment={comment.comment}
                  emoji={comment.emoji}
                  emojiAnimations={emojiAnimations}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const CommentBoard = dynamic(() => Promise.resolve(CommentBoardClient), {
  ssr: false,
});

export default CommentBoard;