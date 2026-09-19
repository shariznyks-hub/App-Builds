import { MCQOption } from '../types';

/**
 * Generate TXT format export
 * Format:
 * 1-B
 * 2-
 * 3-A
 */
export function generateTxtExport(
  startQuestion: number,
  endQuestion: number,
  answers: Record<number, MCQOption>
): string {
  const lines: string[] = [];
  for (let q = startQuestion; q <= endQuestion; q++) {
    const raw = answers[q];
    const ans = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';
    lines.push(`${q}-${ans}`);
  }
  return lines.join('\n');
}

/**
 * Generate CSV format export
 * Format:
 * Question,Answer
 * 1,B
 * 2,
 * 3,A
 */
export function generateCsvExport(
  startQuestion: number,
  endQuestion: number,
  answers: Record<number, MCQOption>
): string {
  const lines: string[] = ['Question,Answer'];
  for (let q = startQuestion; q <= endQuestion; q++) {
    const raw = answers[q];
    const ans = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';
    lines.push(`${q},${ans}`);
  }
  return lines.join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
