declare module 'jspdf-autotable' {
    import jsPDF from 'jspdf';
  
    interface AutoTableOptions {
      startY?: number;
      head: Array<Array<string | number>>;
      body: Array<Array<string | number>>;
      theme?: 'striped' | 'grid' | 'plain';
      styles?: {
        cellPadding?: number;
        fontSize?: number;
        // Fler stilalternativ kan läggas till
      };
    }
  
    export function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  }