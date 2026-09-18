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
const verticalBatteryPath = 'M412 175 C412 165 412 155 412 145 C412 135 412 125 412 115';
const batteryCapsulePoints = parsePathPoints(batteryCapsulePath);
const collapsedBatteryPoints = parsePathPoints(collapsedBatteryPath);
const verticalBatteryPoints = parsePathPoints(verticalBatteryPath);
const hookedBatteryPoints = parsePathPoints(
  'M434 239 C425 241 415 235 412 222 C410 211 412 198 412 187'
);
const orbitCenter = { x: 300, y: 145 };
const orbitRadius = 112;
const travellingArcSweep = 90;
const curlPivot = { x: 414, y: 231 };
const curlRadius = 60;
const curlStartAngle = 55;
const curlSweep = 70;
const curlShapeCenter = { x: curlPivot.x, y: curlPivot.y - curlRadius };
const curledBatteryPoints = createArcPoints(curlStartAngle, curlSweep, curlShapeCenter, curlRadius);
const orbitEntryAngle = 37;
const orbitEntryRadius = 143;

const batteryTiming = {
  collapseEnd: 0.23,
  verticalStart: 0.14,
  verticalEnd: 0.23,
  stripEntryStart: 0.18,
  descentStart: 0.21,
  descentEnd: 0.405,
  hookStart: 0.35,
  hookDuration: 0.055,
  hookPointDelay: 0.006,
  curlStart: 0.405,
  curlEnd: 0.46,
  travelStart: 0.46,
  travelEnd: 0.78,
  growthStart: 0.78,
  growthEnd: 0.96,
};
const fullDuration = 2;

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
  const fallStart = 0.65 + (signalBars.length - 1 - index) * 0.02;
  const fallEnd = 0.96;
  const collapse = smootherStep(range(progress, collapseStart, collapseEnd));
  const pathProgress = rampedLinear(range(progress, fallStart, fallEnd), 0.22);
  const start = {
    x: bar.x,
    y: interpolate(bar.y, 151, collapse),
  };
  const controlOne = {
    x: bar.x,
    y: 200 + index * 65,
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
  const stripEntry = smootherStep(
    range(progress, batteryTiming.stripEntryStart, batteryTiming.verticalEnd)
  );
  const descent = smootherStep(
    range(progress, batteryTiming.descentStart, batteryTiming.descentEnd)
  );
  const travel = rampedStartLinear(
    range(progress, batteryTiming.travelStart, batteryTiming.travelEnd),
    0.04
  );
  const curl = rampedStartLinear(
    range(progress, batteryTiming.curlStart, batteryTiming.curlEnd),
    0.28
  );
  const growth = rampedEndLinear(
    range(progress, batteryTiming.growthStart, batteryTiming.growthEnd),
    0.2
  );

  const collapsedPoints = interpolatePoints(batteryCapsulePoints, collapsedBatteryPoints, collapse);
  const verticalPoints = interpolatePoints(collapsedPoints, verticalBatteryPoints, vertical);
  const descendedPoints = verticalBatteryPoints.map((point) => ({
    x: point.x,
    y: point.y + 72 * descent,
  }));
  const travellingLinePoints = interpolatePoints(verticalPoints, descendedPoints, stripEntry);
  const hookedPoints = travellingLinePoints.map((point, index) =>
    interpolatePoint(
      point,
      hookedBatteryPoints[index],
      smootherStep(
        range(
          progress,
          batteryTiming.hookStart + index * batteryTiming.hookPointDelay,
          batteryTiming.hookStart +
            index * batteryTiming.hookPointDelay +
            batteryTiming.hookDuration
        )
      )
    )
  );
  const curledPoints = interpolatePoints(hookedPoints, curledBatteryPoints, curl);
  if (progress < batteryTiming.travelStart) {
    return pointsToPath(curledPoints);
  }

  const travelAngle = orbitEntryAngle - (360 + orbitEntryAngle) * travel;
  const radiusSettle = smootherStep(range(travel, 0, 0.18));
  const travelRadius = interpolate(orbitEntryRadius, orbitRadius, radiusSettle);
  const travelPivot = pointOnCircle(travelAngle, orbitCenter, travelRadius);
  const orientationSettle = smootherStep(range(travel, 0, 0.075));
  const travelRotation = (travelAngle - 90) * orientationSettle;
  const transformedCurlCenter = transformPoint(
    curlShapeCenter,
    curlPivot,
    travelPivot,
    travelRotation
  );
  const orbitShapeSettle = smootherStep(range(travel, 0.04, 0.16));
  const travellingPoints = createArcPoints(
    interpolate(
      curlStartAngle + travelRotation,
      travelAngle - travellingArcSweep / 2,
      orbitShapeSettle
    ),
    interpolate(curlSweep, travellingArcSweep, orbitShapeSettle),
    interpolatePoint(transformedCurlCenter, orbitCenter, orbitShapeSettle),
    interpolate(curlRadius, travelRadius, orbitShapeSettle)
  );
  if (progress < batteryTiming.growthStart) {
    return pointsToPath(travellingPoints);
  }

  return pointsToPath(createArcPoints(45, -travellingArcSweep - growth * 180));
};

function interpolatePoint(from: Point, to: Point, progress: number) {
  return {
    x: interpolate(from.x, to.x, progress),
    y: interpolate(from.y, to.y, progress),
  };
}

function transformPoint(point: Point, pivot: Point, target: Point, rotation: number) {
  const radians = toRadians(rotation);
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const localX = point.x - pivot.x;
  const localY = point.y - pivot.y;
  return {
    x: target.x + localX * cosine - localY * sine,
    y: target.y + localX * sine + localY * cosine,
  };
}

function createArcPoints(
  startAngle: number,
  sweepAngle: number,
  center = orbitCenter,
  radius = orbitRadius
) {
  const middleAngle = startAngle + sweepAngle / 2;
  const endAngle = startAngle + sweepAngle;
  const first = createArcSegment(startAngle, middleAngle, center, radius);
  const second = createArcSegment(middleAngle, endAngle, center, radius);
  return [first.start, ...first.controls, ...second.controls];
}

function createArcSegment(startAngle: number, endAngle: number, center: Point, radius: number) {
  const start = pointOnCircle(startAngle, center, radius);
  const end = pointOnCircle(endAngle, center, radius);
  const alpha = (4 / 3) * Math.tan(toRadians(endAngle - startAngle) / 4);
  const controlOne = addScaled(start, tangentOnCircle(startAngle, radius), alpha);
  const controlTwo = addScaled(end, tangentOnCircle(endAngle, radius), -alpha);
  return { start, controls: [controlOne, controlTwo, end] };
}

function pointOnCircle(angle: number, center = orbitCenter, radius = orbitRadius) {
  const radians = toRadians(angle);
  return {
    x: center.x + radius * Math.cos(radians),
    y: center.y + radius * Math.sin(radians),
  };
}

function tangentOnCircle(angle: number, radius = orbitRadius) {
  const radians = toRadians(angle);
  return { x: -radius * Math.sin(radians), y: radius * Math.cos(radians) };
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

function rampedStartLinear(value: number, ramp: number) {
  if (value < ramp) return value ** 2 / (ramp * (2 - ramp));
  return (2 * value - ramp) / (2 - ramp);
}

function rampedEndLinear(value: number, ramp: number) {
  const velocity = 1 / (1 - ramp / 2);
  if (value <= 1 - ramp) return velocity * value;
  return 1 - (velocity * (1 - value) ** 2) / (2 * ramp);
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
