"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { MessageCircle } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  comment: string;
  created_at: string;
}

export function CommentBoard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const maxDisplayComments = 12;

  useEffect(() => {
    // Initial fetch
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(maxDisplayComments);
      
      if (data) setComments(data);
    };

    fetchComments();

    // Set up realtime subscription
    const channel = supabase.channel('public:comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          console.log('New comment received:', payload);
          setComments(prevComments => {
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
      <div className="mt-20 relative w-[500px] h-[500px] mx-auto">
        <AnimatePresence>
          {comments.map((comment, index) => {
            const startX = Math.random() * 100;
            const endX = startX + (Math.random() * 40 - 20);
            const yPos = (index % 4) * 25;
            
            return (
              <motion.div
                key={comment.id}
                initial={{ 
                  x: `${startX}%`,
                  y: `${yPos}%`,
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{ 
                  x: `${endX}%`,
                  y: `${yPos}%`,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ 
                  opacity: 0,
                  scale: 0.8,
                }}
                transition={{
                  x: {
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                  },
                  y: {
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  },
                  opacity: { duration: 1 },
                  scale: { duration: 0.5 }
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  zIndex: comments.length - index // Higher z-index for newer comments
                }}
              >
                <div 
                  className="bg-white dark:bg-blue-950 p-4 rounded-lg shadow-lg w-64 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90"
                  style={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">{comment.name}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{comment.comment}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}