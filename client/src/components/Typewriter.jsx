import { useState, useEffect } from 'react';

const Typewriter = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); // Reset text on new response
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

export default Typewriter;