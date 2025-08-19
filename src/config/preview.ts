export const FORCE_PROD = import.meta.env.VITE_FORCE_PROD_PREVIEW === 'true';
export const IS_PROD_VIEW =
  FORCE_PROD || import.meta.env.MODE === 'production';