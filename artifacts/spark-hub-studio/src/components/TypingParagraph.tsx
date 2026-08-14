import { useEffect, useRef, useState } from "react";

type TypingParagraphProps = {
  text: string;
  className?: string;
  delay?: number;
};

export default function TypingParagraph({
  text,
  className = "",
  delay = 0,
}: TypingParagraphProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [started, setStarted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let index = 0;

    const delayTimeout = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        index += 1;
        setDisplayedText(text.slice(0, index));

        if (index >= text.length) {
          window.clearInterval(interval);
        }
      }, 35);
    }, delay);

    return () => window.clearTimeout(delayTimeout);
  }, [started, text, delay]);

  return (
    <p ref={ref} className={className}>
      {displayedText}
      {started && displayedText.length < text.length && (
        <span className="typing-cursor">|</span>
      )}
    </p>
  );
}