import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

const signalBars = [
  { x: 88, y: 151, width: 18, height: 34, finalX: 244, finalY: 238 },
  { x: 122, y: 135, width: 18, height: 50, finalX: 276, finalY: 250 },
  { x: 156, y: 119, width: 18, height: 66, finalX: 306, finalY: 250 },
  { x: 190, y: 103, width: 18, height: 82, finalX: 338, finalY: 238 },
];

const batteryCapsulePath = 'M430 144 C448 144 466 144 484 144 C502 144 520 144 538 144';
const collapsedBatteryPath = 'M412 144 C412 144 412 144 412 144 C412 144 412 144 412 144';
const verticalBatteryPath = 'M412 169 C412 161 412 153 412 145 C412 137 412 129 412 121';
const batteryCapsulePoints = parsePathPoints(batteryCapsulePath);
const collapsedBatteryPoints = parsePathPoints(collapsedBatteryPath);
const verticalBatteryPoints = parsePathPoints(verticalBatteryPath);

const batteryTiming = {
  collapseEnd: 0.2,
  verticalStart: 0.15,
  verticalEnd: 0.23,
  bendStart: 0.34,
  bendEnd: 0.46,
  arcEntryEnd: 0.39,
  orbitStart: 0.38,
  orbitEnd: 0.69,
  growthStart: 0.65,
  growthEnd: 0.96,
};
const fullDuration = 2.3;

export const ConnectivityMorph = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const progress = useMotionValue(0);
  const wrapperOpacity = useMotionValue(1);
  const batteryPath = useTransform(() => getBatteryPath(progress.get()));
  const batteryStrokeWidth = useTransform(() =>
    interpolate(68, 18, smootherStep(range(progress.get(), 0.02, batteryTiming.verticalEnd)))
  );
  const terminalOpacity = useTransform(progress, [0, 0.08, 0.14], [1, 0.25, 0]);

  useEffect(() => {
    const target = isCollapsed ? 1 : 0;

    if (shouldReduceMotion) {
      const fade = animate(wrapperOpacity, [1, 0.35, 1], {
        duration: 0.2,
        times: [0, 0.45, 1],
      });
      const swapState = window.setTimeout(() => progress.set(target), 90);
      return () => {
        window.clearTimeout(swapState);
        fade.stop();
      };
    }

    wrapperOpacity.set(1);
    const distance = Math.abs(target - progress.get());
    const playback = animate(progress, target, {
      duration: fullDuration * distance,
      ease: 'linear',
    });
    return () => playback.stop();
  }, [isCollapsed, progress, shouldReduceMotion, wrapperOpacity]);

  return (
    <motion.div className={styles.wrapper} style={{ opacity: wrapperOpacity }}>
      <svg
        className={styles.artwork}
        viewBox="0 0 600 300"
        role="img"
        aria-label="Cellular, Wi-Fi, and battery symbols combining into one connectivity mark"
      >
        <g className={styles.signal}>
          {signalBars.map((bar, index) => (
            <SignalBar key={bar.x} bar={bar} index={index} progress={progress} />
          ))}
        </g>

        <g className={styles.wifi} aria-hidden="true">
          <path d="M252 119 Q300 79 348 119" />
          <path d="M269 145 Q300 119 331 145" />
          <path className={styles.wifiTip} d="M286 165 Q300 151 314 165 L300 181 Z" />
        </g>

        <motion.path
          className={styles.battery}
          d={batteryPath}
          strokeWidth={batteryStrokeWidth}
          aria-hidden="true"
        />
        <motion.path
          className={styles.batteryTerminal}
          d="M554 134 L554 154"
          style={{ opacity: terminalOpacity }}
          aria-hidden="true"
        />
      </svg>

      <button
        className={styles.toggle}
        type="button"
        aria-pressed={isCollapsed}
        onClick={() => setIsCollapsed((currentState) => !currentState)}
      >
        {isCollapsed ? 'Separate signals' : 'Combine signals'}
      </button>
    </motion.div>
  );
};

const SignalBar = (props: SignalBarProps) => {
  const { bar, index, progress } = props;
  const collapseStart = index * 0.008;
  const collapseEnd = 0.28 + collapseStart;
  const fallStart = 0.39 + (signalBars.length - 1 - index) * 0.02;
  const fallEnd = 0.96;
  const x = useTransform(() => getSignalPosition(bar, index, progress.get()).x);
  const y = useTransform(() => getSignalPosition(bar, index, progress.get()).y);
  const width = useTransform(() => {
    const shapeProgress = smootherStep(range(progress.get(), collapseStart, collapseEnd));
    return interpolate(bar.width, 22, shapeProgress);
  });
  const height = useTransform(() => {
    const shapeProgress = smootherStep(range(progress.get(), collapseStart, collapseEnd));
    return interpolate(bar.height, 22, shapeProgress);
  });
  const radius = useTransform(() => {
    const shapeProgress = smootherStep(range(progress.get(), collapseStart, collapseEnd));
    return interpolate(9, 11, shapeProgress);
  });

  return <motion.rect x={x} y={y} width={width} height={height} rx={radius} aria-hidden="true" />;
};

const getSignalPosition = (bar: SignalBar, index: number, progress: number) => {
  const collapseStart = index * 0.008;
  const collapseEnd = 0.28 + collapseStart;
  const fallStart = 0.39 + (signalBars.length - 1 - index) * 0.02;
  const fallEnd = 0.96;
  const collapse = smootherStep(range(progress, collapseStart, collapseEnd));
  const pathProgress = rampedLinear(range(progress, fallStart, fallEnd), 0.16);
  const start = {
    x: bar.x,
    y: interpolate(bar.y, 151, collapse),
  };
  const controlOne = {
    x: bar.x,
    y: 200 + index * 50,
  };
  const controlTwo = {
    x: bar.finalX - 54 + index * 3,
    y: 260 + index * 8,
  };
  const end = { x: bar.finalX, y: bar.finalY };

  return cubicBezierPoint(start, controlOne, controlTwo, end, pathProgress);
};

const getBatteryPath = (progress: number) => {
  const collapse = smootherStep(range(progress, 0, batteryTiming.collapseEnd));
  const vertical = smootherStep(
    range(progress, batteryTiming.verticalStart, batteryTiming.verticalEnd)
  );
  const bend = smootherStep(range(progress, batteryTiming.bendStart, batteryTiming.bendEnd));
  const arcEntry = smootherStep(
    range(progress, batteryTiming.bendStart, batteryTiming.arcEntryEnd)
  );
  const orbit = rampedLinear(
    range(progress, batteryTiming.orbitStart, batteryTiming.orbitEnd),
    0.14
  );
  const growth = rampedLinear(
    range(progress, batteryTiming.growthStart, batteryTiming.growthEnd),
    0.18
  );

  const collapsedPoints = interpolatePoints(batteryCapsulePoints, collapsedBatteryPoints, collapse);
  const verticalPoints = interpolatePoints(collapsedPoints, verticalBatteryPoints, vertical);
  const orbitingSweep = interpolate(-26, -120, bend);
  const orbitingStart = interpolate(13, 45, bend) - orbit * 360;
  const arcPoints = createArcPoints(orbitingStart, orbitingSweep - growth * 150);
  return pointsToPath(interpolatePoints(verticalPoints, arcPoints, arcEntry));
};

function createArcPoints(startAngle: number, sweepAngle: number) {
  const middleAngle = startAngle + sweepAngle / 2;
  const endAngle = startAngle + sweepAngle;
  const first = createArcSegment(startAngle, middleAngle);
  const second = createArcSegment(middleAngle, endAngle);
  return [first.start, ...first.controls, ...second.controls];
}

function createArcSegment(startAngle: number, endAngle: number) {
  const start = pointOnCircle(startAngle);
  const end = pointOnCircle(endAngle);
  const alpha = (4 / 3) * Math.tan(toRadians(endAngle - startAngle) / 4);
  const controlOne = addScaled(start, tangentOnCircle(startAngle), alpha);
  const controlTwo = addScaled(end, tangentOnCircle(endAngle), -alpha);
  return { start, controls: [controlOne, controlTwo, end] };
}

function pointOnCircle(angle: number) {
  const radians = toRadians(angle);
  return { x: 300 + 112 * Math.cos(radians), y: 145 + 112 * Math.sin(radians) };
}

function tangentOnCircle(angle: number) {
  const radians = toRadians(angle);
  return { x: -112 * Math.sin(radians), y: 112 * Math.cos(radians) };
}

function addScaled(point: Point, vector: Point, amount: number) {
  return {
    x: point.x + vector.x * amount,
    y: point.y + vector.y * amount,
  };
}

function pointToString(point: Point) {
  return `${round(point.x)} ${round(point.y)}`;
}

function pointsToPath(points: Point[]) {
  return `M${pointToString(points[0])} C${points.slice(1, 4).map(pointToString).join(' ')} C${points
    .slice(4)
    .map(pointToString)
    .join(' ')}`;
}

function parsePathPoints(path: string) {
  const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return Array.from({ length: values.length / 2 }, (_, index) => ({
    x: values[index * 2],
    y: values[index * 2 + 1],
  }));
}

function interpolatePoints(from: Point[], to: Point[], progress: number) {
  return from.map((point, index) => ({
    x: interpolate(point.x, to[index].x, progress),
    y: interpolate(point.y, to[index].y, progress),
  }));
}

function cubicBezierPoint(
  start: Point,
  controlOne: Point,
  controlTwo: Point,
  end: Point,
  t: number
) {
  const inverse = 1 - t;
  const startWeight = inverse ** 3;
  const controlOneWeight = 3 * inverse ** 2 * t;
  const controlTwoWeight = 3 * inverse * t ** 2;
  const endWeight = t ** 3;
  return {
    x:
      startWeight * start.x +
      controlOneWeight * controlOne.x +
      controlTwoWeight * controlTwo.x +
      endWeight * end.x,
    y:
      startWeight * start.y +
      controlOneWeight * controlOne.y +
      controlTwoWeight * controlTwo.y +
      endWeight * end.y,
  };
}

function range(value: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

function smootherStep(value: number) {
  return value ** 3 * (value * (value * 6 - 15) + 10);
}

function rampedLinear(value: number, ramp: number) {
  const denominator = 1 - ramp;
  if (value < ramp) return value ** 2 / (2 * ramp) / denominator;
  if (value <= 1 - ramp) return (value - ramp / 2) / denominator;
  return (1 - ramp - (1 - value) ** 2 / (2 * ramp)) / denominator;
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

type SignalBar = (typeof signalBars)[number];

type SignalBarProps = {
  bar: SignalBar;
  index: number;
  progress: MotionValue<number>;
};

type Point = {
  x: number;
  y: number;
};
