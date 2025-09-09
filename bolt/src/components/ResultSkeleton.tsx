export default function ResultSkeleton(){
  return (
    <div className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="skeleton h-5 w-40 rounded-xl"></div>
      <div className="skeleton h-4 w-72 rounded-xl mt-4"></div>
      <div className="skeleton h-32 w-full rounded-xl mt-6"></div>
    </div>
  );
}
