interface QuestionDiagramProps {
  figureUrl?: string[];
}

// Renders question figures served from the question-images storage bucket.
export default function QuestionDiagram({ figureUrl }: QuestionDiagramProps) {
  if (!figureUrl?.length) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
      {figureUrl.map((url) => (
        <img
          key={url}
          src={url}
          alt="Question figure"
          className="max-h-96 max-w-full w-auto rounded border border-gray-300 bg-white object-contain"
          loading="lazy"
        />
      ))}
    </div>
  );
}
