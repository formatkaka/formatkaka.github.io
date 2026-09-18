import React from 'react';
import { Composition } from 'remotion';
import { LLMWarsPerformanceReview } from './LLMWarsPerformanceReview';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="LLMWarsPerformanceReview"
    component={LLMWarsPerformanceReview}
    durationInFrames={755}
    fps={30}
    width={480}
    height={608}
  />
);
