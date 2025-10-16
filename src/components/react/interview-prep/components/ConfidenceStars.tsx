import { Star } from 'lucide-react';

type ConfidenceStarsProps = {
  confidence: number;
  onUpdate: (confidence: number) => void;
};

export const ConfidenceStars = ({ confidence, onUpdate }: ConfidenceStarsProps) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-5 h-5 cursor-pointer transition-all ${
            i <= confidence
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200 hover:fill-orange-300 hover:text-orange-300'
          }`}
          onClick={() => onUpdate(i)}
        />
      ))}
    </div>
  );
};
