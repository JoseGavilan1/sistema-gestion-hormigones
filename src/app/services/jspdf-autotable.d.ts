declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  export interface AutoTableOptions {
    head?: string[][];
    body?: (string | number)[][];
    startY?: number;
    theme?: 'plain' | 'striped' | 'grid' | 'styles';
  }

  export function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
