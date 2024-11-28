import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    previousAutoTable: {
      finalY: number;
    };
  }
}
