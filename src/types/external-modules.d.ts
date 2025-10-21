declare module '../config/profile-mapping.js' {
  export const DUTCH_ARCHETYPES: any;
  export const mapAnswersToArchetype: any;
}

declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
    Workbook?: {
      Sheets?: Array<{
        Drawing?: Array<{
          from: { row: number; col: number };
          image: {
            data: string;
            type: string;
          };
        }>;
      }>;
    };
  }

  export interface WorkSheet {
    [key: string]: any;
  }

  export namespace utils {
    export function sheet_to_json<T = any>(
      worksheet: WorkSheet,
      options?: {
        header?: number | string[];
        defval?: any;
        raw?: boolean;
      }
    ): T[];
  }

  export function read(
    data: ArrayBuffer | string,
    opts?: {
      type?: 'array' | 'binary' | 'string' | 'base64';
      cellStyles?: boolean;
      cellHTML?: boolean;
      bookImages?: boolean;
    }
  ): WorkBook;
}