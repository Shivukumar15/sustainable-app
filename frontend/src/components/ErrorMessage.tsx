interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div className="text-3xl mb-2">&#x26A0;&#xFE0F;</div>
      <p className="text-red-700 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
