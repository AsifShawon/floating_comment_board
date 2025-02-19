// lib/emojiHelpers.ts
export const getStaticEmoji = (rating: number): string => {
    const emojiMap: Record<number, string> = {
      5: "😄",
      4: "🙂",
      3: "😐",
      2: "🙁",
      1: "😞",
    };
    return emojiMap[rating] || "😐";
  };
  
  export const preloadEmojiAnimations = async (): Promise<Record<string, any>> => {
    if (typeof window === "undefined") return {}; // Ensure this runs only on the client side
  
    const emojiMap = {
      5: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/lottie.json",
      4: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/lottie.json",
      3: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f610/lottie.json",
      2: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f641/lottie.json",
      1: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f61e/lottie.json",
    };
  
    const animations: Record<string, any> = {};
    await Promise.all(
      Object.entries(emojiMap).map(async ([rating, url]) => {
        try {
          const response = await fetch(url);
          animations[rating] = await response.json();
        } catch (error) {
          console.error(`Failed to fetch animation for rating ${rating}:`, error);
        }
      })
    );
    return animations;
  };