import { MCQOption, MCQQuestionItem } from '../types';

/**
 * Escape a string field safely for RFC 4180 CSV compliance
 */
function escapeCsv(field: string | undefined | null): string {
  if (field === undefined || field === null) return '""';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate TXT format export
 * Attempt Mode:
 * 1-B
 * 2-
 * 
 * Evaluation Mode (Extended):
 * 1-B | Correct: B | Result: Correct
 * 2- | Correct: C | Result: Unattempted
 */
export function generateTxtExport(
  startQuestion: number,
  endQuestion: number,
  answers: Record<number, MCQOption>,
  isSubmitted: boolean = false,
  questions?: MCQQuestionItem[]
): string {
  const lines: string[] = [];
  const qMap = new Map<number, MCQQuestionItem>();
  if (questions) {
    questions.forEach((q) => qMap.set(q.questionNumber, q));
  }

  for (let q = startQuestion; q <= endQuestion; q++) {
    const raw = answers[q];
    const ans = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';

    if (!isSubmitted) {
      // In Attempt Mode: never reveal answer key
      lines.push(`${q}-${ans}`);
    } else {
      const qItem = qMap.get(q);
      const correct = qItem?.correctAnswer || '';
      let result = 'Unattempted';
      if (ans) {
        result = ans === correct ? 'Correct' : 'Incorrect';
      }
      lines.push(`${q}-${ans} | Correct: ${correct} | Result: ${result}`);
    }
  }
  return lines.join('\n');
}

/**
 * Generate CSV format export
 * Attempt Mode:
 * Question,Answer
 * 1,B
 * 
 * Evaluation Mode:
 * Question,Selected Answer,Correct Answer,Result,Explanation
 * 1,B,B,Correct,"Original Work includes..."
 */
export function generateCsvExport(
  startQuestion: number,
  endQuestion: number,
  answers: Record<number, MCQOption>,
  isSubmitted: boolean = false,
  questions?: MCQQuestionItem[]
): string {
  const qMap = new Map<number, MCQQuestionItem>();
  if (questions) {
    questions.forEach((q) => qMap.set(q.questionNumber, q));
  }

  if (!isSubmitted) {
    // Preserve exact standard CSV format before submission
    const lines: string[] = ['Question,Answer'];
    for (let q = startQuestion; q <= endQuestion; q++) {
      const raw = answers[q];
      const ans = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';
      lines.push(`${q},${ans}`);
    }
    return lines.join('\n');
  }

  // Evaluation Mode: full breakdown
  const lines: string[] = ['Question,Selected Answer,Correct Answer,Result,Explanation'];
  for (let q = startQuestion; q <= endQuestion; q++) {
    const raw = answers[q];
    const userAns = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';
    const qItem = qMap.get(q);
    const correctAns = qItem?.correctAnswer || '';
    const explanation = qItem?.explanation || '';

    let result = 'Unattempted';
    if (userAns) {
      result = userAns === correctAns ? 'Correct' : 'Incorrect';
    }

    lines.push([
      q,
      escapeCsv(userAns),
      escapeCsv(correctAns),
      escapeCsv(result),
      escapeCsv(explanation)
    ].join(','));
  }

  return lines.join('\n');
}

/**
 * Feature 11: Export Incorrect Questions Only (TXT in [Q1]...[/Q1] format)
 * Renumbers questions sequentially [Q1], [Q2], etc. so it can be directly re-imported
 */
export function generateIncorrectQuestionsOnlyTxt(
  questions: MCQQuestionItem[],
  answers: Record<number, MCQOption>
): string {
  const incorrectQuestions: MCQQuestionItem[] = [];

  for (const q of questions) {
    const userAns = answers[q.questionNumber];
    // Only include questions that were answered incorrectly
    if (userAns && q.correctAnswer && userAns !== q.correctAnswer) {
      incorrectQuestions.push(q);
    }
  }

  if (incorrectQuestions.length === 0) {
    return '';
  }

  const blocks: string[] = [];

  incorrectQuestions.forEach((item, index) => {
    const seqNum = index + 1;
    const lines: string[] = [
      `[Q${seqNum}]`,
      `Question: ${item.questionText}`,
      `A: ${item.options.A || ''}`,
      `B: ${item.options.B || ''}`,
      `C: ${item.options.C || ''}`,
      `D: ${item.options.D || ''}`,
      `Correct: ${item.correctAnswer}`
    ];

    if (item.explanation && item.explanation.trim().length > 0) {
      lines.push(`Explanation: ${item.explanation.trim()}`);
    }

    lines.push(`[/Q${seqNum}]`);
    blocks.push(lines.join('\n'));
  });

  return blocks.join('\n\n');
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
