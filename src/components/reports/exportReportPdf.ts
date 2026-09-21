import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export async function exportReportToPdf(
  element: HTMLElement,
  filename = "CleanOnes-Report.pdf"
): Promise<boolean> {
  try {
    
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains("no-print")) {
          return false;
        }
        return true;
      },
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const printableWidth = pdfWidth - margin * 2;
    const printableHeight = (img.height * printableWidth) / img.width;

    if (printableHeight <= pdfHeight - margin * 2) {
      const topOffset = (pdfHeight - printableHeight) / 2;
      pdf.addImage(dataUrl, "PNG", margin, Math.max(margin, topOffset), printableWidth, printableHeight);
    } else {
      let heightLeft = printableHeight;
      let position = margin;

      pdf.addImage(dataUrl, "PNG", margin, position, printableWidth, printableHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - printableHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", margin, position, printableWidth, printableHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.warn("Direct canvas export failed, falling back to print preview:", err);
    try {
      window.print();
      return true;
    } catch {
      return false;
    }
  }
}
