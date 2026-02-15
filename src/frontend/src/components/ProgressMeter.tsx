import { Progress } from '@/components/ui/progress';

interface ProgressMeterProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressMeter({ current, total, className = '' }: ProgressMeterProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium text-foreground">
          {current} / {total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
