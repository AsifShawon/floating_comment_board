// components/CommentCard.tsx
"use client";
import React from "react";
import Lottie from "lottie-react";
import { MessageCircle } from "lucide-react";
import { getStaticEmoji } from "@/lib/emojiHelpers";

interface CommentCardProps {
  name: string;
  comment: string;
  emoji: number;
  emojiAnimations: Record<string, any>;
}

const CommentCard: React.FC<CommentCardProps> = ({
  name,
  comment,
  emoji,
  emojiAnimations,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg w-64 relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold text-gray-800">{name}</h3>
        </div>
        {emojiAnimations[emoji] ? (
          <Lottie
            animationData={emojiAnimations[emoji]}
            style={{ width: 32, height: 32 }}
            loop
            autoplay
          />
        ) : (
          <span className="text-xl">{getStaticEmoji(emoji)}</span>
        )}
      </div>
      <p className="text-gray-600 text-sm">{comment}</p>
    </div>
  );
};

export default CommentCard;