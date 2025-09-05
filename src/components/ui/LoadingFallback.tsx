function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-midnight font-medium">Laden...</p>
      </div>
    </div>
  )
}

export default LoadingFallback