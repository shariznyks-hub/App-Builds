import { MCQOption } from '../types';

export interface ParsedQuestion {
  id: number;
  questionNumber: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: MCQOption;
  explanation?: string;
}

/**
 * Default sample questions meeting the exact user specification
 */
export const SAMPLE_MCQ_INPUT = `[Q1]
Question: Under GFR, which of the following is classified as an Original Work?
A: Routine maintenance of building fixtures
B: A new construction and site preparation for a new building
C: Replacement of a worn-out fixture as part of ordinary maintenance
D: Minor maintenance work that does not add capital value
Correct: B
Explanation: Original Work includes new construction and site preparation for a new building.
[/Q1]

[Q2]
Question: Which constitutional article in India deals with the Annual Financial Statement (Budget)?
A: Article 110
B: Article 112
C: Article 114
D: Article 280
Correct: B
Explanation: Article 112 of the Constitution of India provides for the Annual Financial Statement to be laid before Parliament.
[/Q2]

[Q3]
Question: In project procurement, what does the term 'L1' stand for?
A: Highest technical qualified bidder
B: Lead consortium partner
C: Lowest evaluated responsive bidder
D: Local manufacturing tier one supplier
Correct: C
Explanation: L1 refers to the Lowest Evaluated Responsive Bidder according to procurement guidelines.
[/Q3]`;

/**
 * Robust parser for [Q1] ... [/Q1] format
 */
export function parseMCQInput(rawText: string): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const questions: ParsedQuestion[] = [];
  // Match blocks starting with [Q...] and ending with [/Q...]
  const blockRegex = /\[Q\s*(\d*)\]([\s\S]*?)\[\/Q\s*\1?\]/gi;
  let match: RegExpExecArray | null;
  let fallbackIndex = 1;

  while ((match = blockRegex.exec(rawText)) !== null) {
    const rawNumber = match[1];
    const blockContent = match[2].trim();

    const qNum = rawNumber ? parseInt(rawNumber, 10) : fallbackIndex;

    const parsed = parseSingleBlock(blockContent, qNum);
    if (parsed) {
      questions.push(parsed);
      fallbackIndex = qNum + 1;
    }
  }

  // Fallback: If no [Q1] tags were found, attempt to parse if user pasted without tags or single block
  if (questions.length === 0) {
    const single = parseSingleBlock(rawText.trim(), 1);
    if (single) {
      questions.push(single);
    }
  }

  return questions;
}

function parseSingleBlock(content: string, questionNumber: number): ParsedQuestion | null {
  // Extract Question:
  const questionMatch = content.match(/Question:\s*([\s\S]*?)(?=(?:\r?\n[A-D]:|\r?\nCorrect:|\r?\nExplanation:|$))/i);
  const questionText = questionMatch ? questionMatch[1].trim() : `Question ${questionNumber}`;

  // Extract Options A, B, C, D
  const optionA = extractOption(content, 'A');
  const optionB = extractOption(content, 'B');
  const optionC = extractOption(content, 'C');
  const optionD = extractOption(content, 'D');

  // Extract Correct answer
  const correctMatch = content.match(/Correct:\s*([A-D])/i);
  const rawCorrect = correctMatch ? correctMatch[1].toUpperCase() : 'A';
  const correctAnswer: MCQOption = (rawCorrect === 'B' || rawCorrect === 'C' || rawCorrect === 'D') ? rawCorrect : 'A';

  // Extract optional Explanation:
  const explanationMatch = content.match(/Explanation:\s*([\s\S]*?)$/i);
  const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;

  return {
    id: questionNumber,
    questionNumber,
    questionText,
    options: {
      A: optionA || 'Option A',
      B: optionB || 'Option B',
      C: optionC || 'Option C',
      D: optionD || 'Option D',
    },
    correctAnswer,
    explanation: explanation || undefined,
  };
}

function extractOption(content: string, letter: 'A' | 'B' | 'C' | 'D'): string {
  // Regex looks for ^A: or \nA: followed by option text up to the next option or key
  const regex = new RegExp(`(?:^|\\r?\\n)${letter}:\\s*([\\s\\S]*?)(?=(?:\\r?\\n[A-D]:|\\r?\\nCorrect:|\\r?\\nExplanation:|$))`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}
