import './styles.css';
import { useState } from 'react';

export const TextReveal = () => {
  const [reset, setReset] = useState(0);
  const WORD = 'Animations';

  return (
    <div>
      <div key={reset}>
        <h1>
          {WORD.split('').map((char, index) => (
            <span key={index} style={{ '--index': index } as React.CSSProperties}>
              {char}
            </span>
          ))}
        </h1>
      </div>
      <div className="button-container">
        <button className="button" onClick={() => setReset(reset + 1)}>
          Replay animation
        </button>
      </div>
    </div>
  );
};
