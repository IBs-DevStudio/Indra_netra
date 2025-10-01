
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  progress?: number;
}

export function LoadingSpinner({ size = 'md', text, progress }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-600 border-t-orange-500`}></div>
      {text && <p className="mt-3 text-gray-400 text-sm">{text}</p>}
      {progress !== undefined && (
        <div className="mt-3 w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Loading Model</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}