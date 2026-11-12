export default function ConferenceDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 bg-lightGray rounded w-32 mb-6" />
      <div className="relative h-56 bg-lightGray rounded-xl mb-6" />
      <div className="h-8 bg-lightGray rounded w-2/3 mb-2" />
      <div className="h-4 bg-lightGray rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-lightGray rounded" />
        <div className="h-4 bg-lightGray rounded w-5/6" />
        <div className="h-4 bg-lightGray rounded w-4/6" />
      </div>
    </div>
  );
}
