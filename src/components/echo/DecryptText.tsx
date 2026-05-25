import { useEffect, useState } from "react";

export function DecryptText({
  text,
  duration = 900,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) {
  const [out, setOut] = useState("");
  useEffect(() => {
    const chars = "!<>-_\\/[]{}—=+*^?#________ABCDEF0123456789";
    let frame = 0;
    const steps = Math.max(8, Math.floor(duration / 40));
    const id = setInterval(() => {
      frame++;
      const ratio = frame / steps;
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (i < Math.floor(text.length * ratio)) s += text[i];
        else s += chars[Math.floor(Math.random() * chars.length)];
      }
      setOut(s);
      if (frame >= steps) {
        setOut(text);
        clearInterval(id);
      }
    }, 40);
    return () => clearInterval(id);
  }, [text, duration]);
  return <span className={className}>{out}</span>;
}
