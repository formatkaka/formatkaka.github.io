import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Speaker = 'Engineer' | 'Founder' | 'Michael Scott';
type Line = { speaker: Speaker; provider: string; text: string; round: number };

const lines: Line[] = [
  {
    round: 1,
    speaker: 'Engineer',
    provider: 'OpenAI',
    text: 'Reviews used to be about bugs. Now they’re about how fast I can hide incompetence with AI.',
  },
  {
    round: 1,
    speaker: 'Founder',
    provider: 'Claude',
    text: 'We automated self-esteem into a 3 AM microservice. Slack messages now determine your bonus. Pure synergy.',
  },
  {
    round: 1,
    speaker: 'Michael Scott',
    provider: 'Grok',
    text: 'Jan once made us hug during reviews. I cried for a Dundie. Honestly, that system felt healthier.',
  },
  {
    round: 2,
    speaker: 'Engineer',
    provider: 'OpenAI',
    text: 'Add a panic button that shoots confetti when I sigh. Then promote me to Ringmaster of Deadlines.',
  },
  {
    round: 2,
    speaker: 'Founder',
    provider: 'Claude',
    text: 'PerformanceAI tracks elevator rides and Slack blinks. Dopamine below 7.3? The algorithm fires you. Efficiency!',
  },
  {
    round: 2,
    speaker: 'Michael Scott',
    provider: 'Grok',
    text: 'That’s worse than my trust fall. I’ll juggle staplers until someone loves me enough to clap.',
  },
  {
    round: 3,
    speaker: 'Engineer',
    provider: 'OpenAI',
    text: 'Stop making work a carnival. Review what I shipped, hand me a checklist, and give me a raise.',
  },
  {
    round: 3,
    speaker: 'Founder',
    provider: 'Claude',
    text: 'Your checklist is why PerformanceOS is replacing you. No raise—you’re being assimilated into the cloud.',
  },
  {
    round: 3,
    speaker: 'Michael Scott',
    provider: 'Grok',
    text: 'The cloud can swallow us. My mug will remain—the only employee with job security.',
  },
];

const colors: Record<Speaker, string> = {
  Engineer: '#3ca36b',
  Founder: '#d86b49',
  'Michael Scott': '#4778a8',
};

const Header: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 11,
      letterSpacing: 2.6,
      fontWeight: 900,
      color: '#111820',
    }}
  >
    <span>YEL-LMS</span>
    <span style={{ fontSize: 9, letterSpacing: 1.4 }}>
      <i
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#f15b68',
          marginRight: 7,
        }}
      />
      THREE PERSONAS. ZERO PEACE.
    </span>
  </div>
);

const Card: React.FC<{ line: Line; visible: number }> = ({ line, visible }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: Math.max(0, frame - visible),
    fps,
    config: { damping: 18, stiffness: 130 },
  });
  const revealFrames = 42;
  const revealProgress = interpolate(frame, [visible + 5, visible + 5 + revealFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const chars = Math.floor(line.text.length * revealProgress);
  const text = line.text.slice(0, chars);
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 11,
        padding: '13px 14px',
        display: 'flex',
        gap: 11,
        boxShadow: '0 5px 15px rgba(47,64,82,.08)',
        border: `1px solid ${colors[line.speaker]}55`,
        opacity: interpolate(enter, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enter, [0, 1], [12, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: colors[line.speaker],
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          fontSize: 10,
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {line.speaker === 'Michael Scott' ? 'MS' : line.speaker === 'Engineer' ? 'SE' : 'AF'}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            color: colors[line.speaker],
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 0.5,
          }}
        >
          {line.speaker.toUpperCase()}{' '}
          <span style={{ float: 'right', color: '#a7afb9', fontSize: 9 }}>
            #{line.speaker === 'Engineer' ? 1 : line.speaker === 'Founder' ? 2 : 3}
          </span>
        </div>
        <div
          style={{
            color: '#111820',
            fontSize: 14,
            lineHeight: 1.22,
            fontWeight: 650,
            marginTop: 7,
          }}
        >
          {text}
          {revealProgress > 0 && revealProgress < 1 ? (
            <span style={{ color: colors[line.speaker] }}>▍</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Persona: React.FC<{
  label: Speaker;
  icon: React.ReactNode;
  delay: number;
}> = ({ label, icon, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,.94)',
        borderRadius: 16,
        padding: '15px 5px 13px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(30,54,86,.11)',
        border: `1px solid ${colors[label]}33`,
        transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          margin: '0 auto 9px',
          width: 42,
          height: 42,
          borderRadius: 13,
          display: 'grid',
          placeItems: 'center',
          background: `${colors[label]}16`,
          color: colors[label],
          fontSize: label === 'Engineer' ? 17 : 20,
          fontWeight: 950,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          color: colors[label],
          fontSize: 9,
          fontWeight: 950,
          letterSpacing: 0.7,
        }}
      >
        {label.toUpperCase()}
      </div>
    </div>
  );
};

export const LLMWarsPerformanceReview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const introEnd = 95;
  const roundStarts = [95, 285, 475];
  const outroStart = 665;
  const isIntro = frame < introEnd;
  const isOutro = frame >= outroStart;
  const round = isIntro ? 1 : frame < roundStarts[1] ? 1 : frame < roundStarts[2] ? 2 : 3;
  const roundStart = isIntro ? 0 : roundStarts[round - 1];
  const roundLines = lines.filter((line) => line.round === round);
  const outroEnter = spring({
    frame: frame - outroStart,
    fps,
    config: { damping: 18, stiffness: 110 },
  });
  const contentOpacity = interpolate(frame, [outroStart - 8, outroStart], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        background: '#f4f7fb',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#111820',
      }}
    >
      <Audio src={staticFile('audio/llm-wars-performance-review.m4a')} volume={0.9} />
      <AbsoluteFill style={{ padding: '22px 16px', opacity: contentOpacity }}>
        <Header />
        {isIntro ? (
          <>
            <div
              style={{
                position: 'absolute',
                width: 230,
                height: 230,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(72,112,255,.17), rgba(72,112,255,0) 70%)',
                top: 70,
                left: -80,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(241,91,104,.13), rgba(241,91,104,0) 70%)',
                top: 190,
                right: -70,
              }}
            />
            <div
              style={{
                marginTop: 53,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 9,
                  fontWeight: 950,
                  letterSpacing: 1.6,
                  background: '#131921',
                  color: '#fff',
                  borderRadius: 18,
                  padding: '8px 13px',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#70e39a',
                    boxShadow: '0 0 0 4px rgba(112,227,154,.14)',
                  }}
                />
                ANNUAL REVIEW · LIVE
              </div>
              <div
                style={{
                  fontSize: 39,
                  letterSpacing: -1.6,
                  lineHeight: 0.98,
                  fontWeight: 950,
                  marginTop: 23,
                }}
              >
                Performance
                <br />
                Review <span style={{ color: '#386de0' }}>2.0</span>
              </div>
              <div
                style={{
                  color: '#657181',
                  fontSize: 13,
                  lineHeight: 1.4,
                  fontWeight: 700,
                  marginTop: 14,
                }}
              >
                One meeting. Three opinions.
                <br />
                Absolutely no HR supervision.
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 9,
                marginTop: 35,
                position: 'relative',
              }}
            >
              <Persona label="Engineer" icon="</>" delay={28} />
              <Persona label="Founder" icon="↗" delay={35} />
              <Persona label="Michael Scott" icon="MS" delay={42} />
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: 29,
                color: '#657181',
                fontSize: 10,
                letterSpacing: 1.7,
                fontWeight: 900,
              }}
            >
              LET THE REVIEW BEGIN ↓
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                marginTop: 22,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 2.2,
                    fontWeight: 900,
                    color: '#657181',
                  }}
                >
                  {round === 3 ? 'FINAL ROUND' : `ROUND ${round}`}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    lineHeight: 1.05,
                    fontWeight: 950,
                    marginTop: 5,
                  }}
                >
                  Performance Review
                  <br />
                  in the Age of AI
                </div>
              </div>
              <div style={{ fontSize: 18, color: '#386de0', fontWeight: 900 }}>
                {round} <span style={{ color: '#657181', fontSize: 10 }}>/ 3</span>
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {roundLines.map((line, i) => (
                <Card key={line.speaker} line={line} visible={roundStart + 10 + i * 48} />
              ))}
            </div>
          </>
        )}
      </AbsoluteFill>
      {isOutro && (
        <AbsoluteFill
          style={{
            overflow: 'hidden',
            background: '#101722',
            color: '#fff',
            padding: '22px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 360,
              height: 360,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56,109,224,.42), rgba(56,109,224,0) 70%)',
              top: -150,
              left: -130,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(241,91,104,.26), rgba(241,91,104,0) 70%)',
              right: -130,
              bottom: -120,
            }}
          />
          <div
            style={{
              position: 'relative',
              marginTop: 92,
              opacity: outroEnter,
              transform: `translateY(${interpolate(outroEnter, [0, 1], [18, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, color: '#9eabc0' }}>
              MUNDANE TOPICS. UNNECESSARY CONFLICT.
            </div>
            <div
              style={{
                marginTop: 20,
                fontSize: 48,
                lineHeight: 0.95,
                letterSpacing: -2,
                fontWeight: 950,
              }}
            >
              LLM <span style={{ color: '#6f98f4' }}>WARS</span>
            </div>
            <div
              style={{
                maxWidth: 330,
                margin: '22px auto 0',
                fontSize: 15,
                lineHeight: 1.4,
                fontWeight: 650,
                color: '#c8d0dc',
              }}
            >
              Pick a topic. Choose three personas.
              <br />
              Watch diplomacy collapse.
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                marginTop: 34,
                padding: '13px 20px',
                borderRadius: 24,
                background: '#fff',
                color: '#101722',
                fontSize: 12,
                fontWeight: 950,
                letterSpacing: 0.6,
                boxShadow: '0 10px 30px rgba(0,0,0,.25)',
              }}
            >
              START A DEBATE <span style={{ color: '#386de0', fontSize: 17 }}>→</span>
            </div>
            <div style={{ marginTop: 17, fontSize: 10, fontWeight: 800, color: '#86a8f3' }}>
              formatkaka.github.io/tech/llm-wars
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
