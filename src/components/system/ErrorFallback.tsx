import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Props = { onRetry?: () => void };

function ErrorFallback({ onRetry }: Props) {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-xl text-text mb-2">Dat ging niet helemaal goed</h3>
      <p className="text-muted mb-4">Wij hebben het even opnieuw geprobeerd. Klik hieronder om het nogmaals te laden.</p>
      <Button variant="secondary" onClick={onRetry}>Opnieuw proberen</Button>
    </Card>
  );
}

export default ErrorFallback;