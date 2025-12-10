import { useState, useEffect } from 'react';
import { getActiveTestimonials, type Testimonial } from '@/services/testimonials/testimonialsService';

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getActiveTestimonials();
        if (mounted) {
          setTestimonials(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load testimonials'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { testimonials, loading, error };
}
