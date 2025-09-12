// PDF Generation utility for applications
import jsPDF from 'jspdf';

export interface ApplicationPDFData {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
  applicantEmail: string;
  submittedAt: Date;
  personalInformation: string;
  internshipDetails: string;
  courseInformation: string;
  assignmentInformation: string;
  status: string;
}

export class ApplicationPDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = 20;
    this.margin = 20;
  }

  private addText(text: string, fontSize: number = 12, isBold: boolean = false): void {
    this.doc.setFontSize(fontSize);
    if (isBold) {
      this.doc.setFont(undefined, 'bold');
    } else {
      this.doc.setFont(undefined, 'normal');
    }

    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    
    // Check if we need a new page
    if (this.currentY + (lines.length * fontSize * 0.5) > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * fontSize * 0.5 + 5;
  }

  private addSection(title: string, content: string): void {
    this.addText(title, 14, true);
    this.addText(content, 12, false);
    this.currentY += 5; // Extra spacing between sections
  }

  private addHeader(data: ApplicationPDFData): void {
    // Title
    this.addText('INTERNSHIP APPLICATION', 18, true);
    this.currentY += 5;

    // Application details
    this.addText(`Application ID: ${data.applicationId}`, 10);
    this.addText(`Position: ${data.jobTitle}`, 12, true);
    this.addText(`Company: ${data.companyName}`, 12, true);
    this.addText(`Applicant: ${data.applicantName}`, 12);
    this.addText(`Email: ${data.applicantEmail}`, 12);
    this.addText(`Submitted: ${data.submittedAt.toLocaleDateString()}`, 12);
    this.addText(`Status: ${data.status.toUpperCase()}`, 12, true);
    
    this.currentY += 10;
    
    // Add a line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 15;
    this.doc.setFontSize(8);
    this.doc.setFont(undefined, 'normal');
    this.doc.text(
      `Generated on ${new Date().toLocaleDateString()} - Job Finder Platform`,
      this.margin,
      footerY
    );
  }

  public generateApplicationPDF(data: ApplicationPDFData): Uint8Array {
    // Add header
    this.addHeader(data);

    // Add sections
    this.addSection('Personal Information', data.personalInformation);
    this.addSection('Internship Details', data.internshipDetails);
    this.addSection('Course Information', data.courseInformation);
    this.addSection('Assignment Information', data.assignmentInformation);

    // Add footer to all pages
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.addFooter();
    }

    return this.doc.output('arraybuffer') as Uint8Array;
  }

  public downloadApplicationPDF(data: ApplicationPDFData): void {
    this.generateApplicationPDF(data);
    const filename = `application_${data.applicationId}_${data.applicantName.replace(/\s+/g, '_')}.pdf`;
    this.doc.save(filename);
  }

  public static async generateAndDownload(data: ApplicationPDFData): Promise<void> {
    const generator = new ApplicationPDFGenerator();
    generator.downloadApplicationPDF(data);
  }

  public static async generatePDFBlob(data: ApplicationPDFData): Promise<Blob> {
    const generator = new ApplicationPDFGenerator();
    const pdfData = generator.generateApplicationPDF(data);
    return new Blob([pdfData], { type: 'application/pdf' });
  }
}

// Utility function for easy PDF generation
export const generateApplicationPDF = (data: ApplicationPDFData): Promise<Blob> => {
  return ApplicationPDFGenerator.generatePDFBlob(data);
};

// Utility function for easy PDF download
export const downloadApplicationPDF = (data: ApplicationPDFData): void => {
  ApplicationPDFGenerator.generateAndDownload(data);
};
