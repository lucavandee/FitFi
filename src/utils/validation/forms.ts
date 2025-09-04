/**
 * Form helpers voor toegankelijke validatie.
 * 
 * ariaInvalid(err): boolean
 * 
 * describedById(baseId, hasErr): string | undefined
 * 
 * fieldA11y(baseId, err): { 'aria-invalid': boolean; 'aria-describedby'?: string }
 * 
 * compactError(errors): kleine helper om leeg te filteren
 */

export function ariaInvalid(err?: string | null): boolean {
  return Boolean(err && String(err).trim().length > 0);
}

export function describedById(baseId: string, hasErr: boolean): string | undefined {
  return hasErr ? `${baseId}-err` : undefined;
}

export function fieldA11y(baseId: string, err?: string | null): {
  "aria-invalid": boolean;
  "aria-describedby"?: string;
} {
  const invalid = ariaInvalid(err);
  return {
    "aria-invalid": invalid,
    "aria-describedby": describedById(baseId, invalid),
  };
}

export function compactError<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const k of Object.keys(obj) as (keyof T)[]) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") out[k] = v;
  }
  return out;
}