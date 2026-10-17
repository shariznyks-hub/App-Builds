package com.mcq.answerpad.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mcq.answerpad.MCQViewModel
import com.mcq.answerpad.ui.theme.*

private const val SAMPLE_QUESTIONS_TEMPLATE = """[Q1]
Question: Under GFR, which of the following is classified as an Original Work?
A: Routine maintenance of building fixtures
B: A new construction and site preparation for a new building
C: Replacement of a worn-out fixture as part of ordinary maintenance
D: Minor maintenance work that does not add capital value
Correct: B
Explanation: Original Work includes new construction and site preparation for a new building.
[/Q1]

[Q2]
Question: What is the maximum period for which a contract for hiring services can normally be executed under GFR?
A: 1 Year
B: 2 Years
C: 3 Years
D: 5 Years
Correct: C
Explanation: The normal duration for service contracts under standard rules is up to 3 years with annual performance reviews.
[/Q2]

[Q3]
Question: In case of procurement of goods through GeM, direct purchase without comparative quotations is permitted up to:
A: Rs. 25,000
B: Rs. 50,000
C: Rs. 1,00,000
D: Rs. 2,50,000
Correct: A
Explanation: Direct purchase on GeM without comparison is permissible up to Rs. 25,000 for available products.
[/Q3]"""

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MCQScreen(viewModel: MCQViewModel) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val options = listOf("A", "B", "C", "D")
    val qItem = state.currentQuestionItem

    val isAttempted = !state.currentAnswer.isNullOrBlank()
    val isCorrect = state.isSubmitted && qItem != null && qItem.correctAnswer.isNotBlank() && qItem.correctAnswer.equals(state.currentAnswer?.trim(), ignoreCase = true)
    val isIncorrect = state.isSubmitted && qItem != null && isAttempted && !isCorrect
    val isUnattempted = state.isSubmitted && !isAttempted

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "MCQ Answer Pad",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                actions = {
                    // Paste Questions Button
                    FilledTonalButton(
                        onClick = { viewModel.setImportDialog(true) },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = Slate800,
                            contentColor = AmberSkip
                        ),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.padding(end = 4.dp)
                    ) {
                        Icon(
                            Icons.Default.PostAdd,
                            contentDescription = "Paste Questions",
                            modifier = Modifier.size(16.dp),
                            tint = AmberSkip
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Paste Qs", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    // Submit Test or Retake Button
                    if (!state.isSubmitted) {
                        Button(
                            onClick = { viewModel.setSubmitConfirmDialog(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.padding(end = 4.dp)
                        ) {
                            Icon(
                                Icons.Default.Send,
                                contentDescription = "Submit Test",
                                modifier = Modifier.size(14.dp),
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Submit", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    } else {
                        Button(
                            onClick = { viewModel.retakeTest() },
                            colors = ButtonDefaults.buttonColors(containerColor = BlueAccent),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.padding(end = 4.dp)
                        ) {
                            Icon(
                                Icons.Default.Refresh,
                                contentDescription = "Retake Test",
                                modifier = Modifier.size(14.dp),
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Retake", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }

                    // Secondary actions dropdown or icons
                    IconButton(onClick = { viewModel.setExportDialog(true) }) {
                        Icon(Icons.Default.Share, contentDescription = "Export", tint = Slate400)
                    }
                    IconButton(onClick = { viewModel.setSetupDialog(true) }) {
                        Icon(Icons.Default.Tune, contentDescription = "Range Settings", tint = Slate400)
                    }
                    if (!state.isSubmitted) {
                        IconButton(onClick = { viewModel.setClearAllDialog(true) }) {
                            Icon(Icons.Default.DeleteSweep, contentDescription = "Clear All", tint = RoseClear)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Slate900,
                    titleContentColor = Slate100,
                    actionIconContentColor = Slate100
                )
            )
        },
        containerColor = Slate950
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 14.dp, vertical = 6.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // EVALUATION SCORE BANNER (Shown at top post-submission)
            if (state.isSubmitted) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 10.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(2.dp, EmeraldAccent.copy(alpha = 0.5f))
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Test Evaluation Results",
                                color = EmeraldAccent,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Surface(
                                color = Slate800,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "Score: ${state.correctCount}/${state.totalQuestions} (${state.finalScorePercentage}%)",
                                    color = Color.White,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 13.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            // Correct badge
                            Surface(
                                modifier = Modifier.weight(1f),
                                color = EmeraldAccent.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldAccent.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "✓ ${state.correctCount} Correct",
                                    color = EmeraldAccent,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }

                            // Incorrect badge
                            Surface(
                                modifier = Modifier.weight(1f),
                                color = RoseClear.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, RoseClear.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "✗ ${state.incorrectCount} Wrong",
                                    color = RoseClear,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }

                            // Unattempted badge
                            Surface(
                                modifier = Modifier.weight(1f),
                                color = AmberSkip.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, AmberSkip.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "○ ${state.unattemptedEvaluatedCount} Skipped",
                                    color = AmberSkip,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }
                        }
                    }
                }
            }

            // QUICK BANNER IF NO QUESTIONS LOADED YET
            if (state.questions.isEmpty() && !state.isSubmitted) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .clickable { viewModel.setImportDialog(true) },
                    color = Slate900,
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AmberSkip.copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.PostAdd, contentDescription = null, tint = AmberSkip, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("Want question text & auto-grading?", color = Slate100, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Text("Paste MCQs in [Q1]...[/Q1] format with hidden key", color = Slate400, fontSize = 10.sp)
                            }
                        }
                        Button(
                            onClick = { viewModel.setImportDialog(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = AmberSkip),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text("Paste Qs", color = Slate950, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // QUESTION HEADER & COUNTERS BAR
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Question ${state.currentQuestion} / ${state.endQuestion}",
                            modifier = Modifier.weight(1f, fill = false),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = BlueAccent,
                            maxLines = 1,
                            softWrap = false
                        )

                        Spacer(modifier = Modifier.width(6.dp))

                        // Status Badge
                        if (!state.isSubmitted) {
                            val isAnswered = !state.currentAnswer.isNullOrBlank()
                            Surface(
                                color = if (isAnswered) BlueAccent.copy(alpha = 0.2f) else Slate800,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isAnswered) BlueAccent else Slate700
                                )
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(RoundedCornerShape(3.dp))
                                            .background(if (isAnswered) BlueAccent else AmberSkip)
                                    )
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Text(
                                        text = if (isAnswered) "Answered (${state.currentAnswer})" else "Unanswered",
                                        color = if (isAnswered) BlueAccent else Slate400,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        softWrap = false
                                    )
                                }
                            }
                        } else {
                            // Evaluation mode badge for current question
                            val (badgeBg, badgeBorder, badgeText, badgeColor) = when {
                                isCorrect -> Quadruple(EmeraldAccent.copy(alpha = 0.2f), EmeraldAccent, "✓ Correct", EmeraldAccent)
                                isIncorrect -> Quadruple(RoseClear.copy(alpha = 0.2f), RoseClear, "✗ Incorrect", RoseClear)
                                else -> Quadruple(AmberSkip.copy(alpha = 0.2f), AmberSkip, "○ Unattempted", AmberSkip)
                            }
                            Surface(
                                color = badgeBg,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, badgeBorder)
                            ) {
                                Text(
                                    text = badgeText,
                                    color = badgeColor,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    maxLines = 1,
                                    softWrap = false
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Answered: ${state.answeredCount}",
                            color = Slate400,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            softWrap = false
                        )
                        Button(
                            onClick = { viewModel.setUnansweredDialog(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Unanswered: ${state.unansweredCount}",
                                color = AmberSkip,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                maxLines = 1,
                                softWrap = false
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    val progress = if (state.totalQuestions > 0) state.answeredCount.toFloat() / state.totalQuestions else 0f
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp)),
                        color = BlueAccent,
                        trackColor = Slate800
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // QUESTION TEXT CARD (If parsed question exists)
            if (qItem != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Q${state.currentQuestion}.",
                            color = BlueAccent,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = qItem.questionText,
                            color = Slate100,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium,
                            lineHeight = 20.sp
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            // MCQ OPTIONS A, B, C, D
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                options.forEach { opt ->
                    val isSelected = state.currentAnswer == opt
                    val optText = qItem?.options?.get(opt)
                    val isOptionCorrect = state.isSubmitted && qItem != null && qItem.correctAnswer.equals(opt, ignoreCase = true)
                    val isOptionWrongSelected = state.isSubmitted && isSelected && !isOptionCorrect

                    val (containerColor, contentColor, borderColor, borderWidth) = when {
                        !state.isSubmitted -> {
                            // ATTEMPT MODE: Normal selection highlight, NEVER reveal answer
                            if (isSelected) {
                                Quadruple(BlueSelected, Color.White, BlueAccent, 2.dp)
                            } else {
                                Quadruple(Slate900, Slate100, Slate800, 1.dp)
                            }
                        }
                        isOptionCorrect -> {
                            // POST-SUBMISSION: Correct answer highlighted GREEN
                            Quadruple(EmeraldAccent.copy(alpha = 0.25f), Color.White, EmeraldAccent, 2.dp)
                        }
                        isOptionWrongSelected -> {
                            // POST-SUBMISSION: User selected wrong answer highlighted RED
                            Quadruple(RoseClear.copy(alpha = 0.25f), Color.White, RoseClear, 2.dp)
                        }
                        else -> {
                            Quadruple(Slate900.copy(alpha = 0.6f), Slate400, Slate800, 1.dp)
                        }
                    }

                    Button(
                        onClick = {
                            if (!state.isSubmitted) {
                                viewModel.answerCurrent(opt)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .defaultMinSize(minHeight = 52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = containerColor,
                            contentColor = contentColor
                        ),
                        border = androidx.compose.foundation.BorderStroke(borderWidth, borderColor),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = if (isSelected || isOptionCorrect) contentColor.copy(alpha = 0.2f) else Slate800,
                                    modifier = Modifier.size(30.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = opt,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Black,
                                            color = contentColor
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.width(10.dp))

                                if (!optText.isNullOrBlank()) {
                                    Text(
                                        text = optText,
                                        fontSize = 14.sp,
                                        fontWeight = if (isSelected || isOptionCorrect) FontWeight.Bold else FontWeight.Normal,
                                        color = contentColor,
                                        textAlign = TextAlign.Start,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                } else {
                                    Text(
                                        text = "Option $opt",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = contentColor
                                    )
                                }
                            }

                            // Icons on right
                            if (!state.isSubmitted && isSelected) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = "Selected",
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            } else if (state.isSubmitted) {
                                if (isOptionCorrect) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text("Correct", color = EmeraldAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Icon(
                                            Icons.Default.CheckCircle,
                                            contentDescription = "Correct Answer",
                                            tint = EmeraldAccent,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                } else if (isOptionWrongSelected) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text("Your Answer", color = RoseClear, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Icon(
                                            Icons.Default.Cancel,
                                            contentDescription = "Wrong Answer",
                                            tint = RoseClear,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // POST-SUBMISSION EXPLANATION & CORRECT ANSWER CARD
            if (state.isSubmitted && qItem != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldAccent.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Correct Answer: ${qItem.correctAnswer}",
                                color = EmeraldAccent,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        if (qItem.explanation.isNotBlank()) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Explanation:",
                                color = Slate400,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = qItem.explanation,
                                color = Slate100,
                                fontSize = 13.sp,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }

            // SKIP BUTTON (ATTEMPT MODE ONLY)
            if (!state.isSubmitted) {
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { viewModel.skipCurrent() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Slate900,
                        contentColor = AmberSkip
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                ) {
                    Icon(
                        Icons.Default.FastForward,
                        contentDescription = "Skip",
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Skip Question",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // BOTTOM NAVIGATION CONTROLS (PREV, CLEAR, NEXT)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // PREV
                Button(
                    onClick = { viewModel.previousQuestion() },
                    enabled = state.currentQuestion > state.startQuestion,
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Slate900,
                        contentColor = Slate100,
                        disabledContainerColor = Slate900.copy(alpha = 0.5f),
                        disabledContentColor = Slate700
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Prev", fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                }

                // CLEAR ANSWER (Attempt Mode) or REVIEW (Evaluation Mode)
                if (!state.isSubmitted) {
                    Button(
                        onClick = { viewModel.clearCurrentAnswer() },
                        enabled = !state.currentAnswer.isNullOrBlank(),
                        modifier = Modifier
                            .weight(1.2f)
                            .height(44.dp),
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Slate900,
                            contentColor = RoseClear,
                            disabledContainerColor = Slate900.copy(alpha = 0.5f),
                            disabledContentColor = Slate700
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                    ) {
                        Icon(
                            Icons.Default.Clear,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clear Ans", fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                    }
                } else {
                    Button(
                        onClick = { viewModel.setUnansweredDialog(true) },
                        modifier = Modifier
                            .weight(1.2f)
                            .height(44.dp),
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Slate900,
                            contentColor = AmberSkip
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                    ) {
                        Text("Review All", fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                    }
                }

                // NEXT
                Button(
                    onClick = { viewModel.nextQuestion() },
                    enabled = state.currentQuestion < state.endQuestion,
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Slate900,
                        contentColor = Slate100,
                        disabledContainerColor = Slate900.copy(alpha = 0.5f),
                        disabledContentColor = Slate700
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                ) {
                    Text("Next", fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }

    // PASTE QUESTIONS MODAL / DIALOG
    if (state.showImportDialog) {
        var rawInput by remember { mutableStateOf("") }
        var errorMessage by remember { mutableStateOf<String?>(null) }

        AlertDialog(
            onDismissRequest = { viewModel.setImportDialog(false) },
            containerColor = Slate900,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.PostAdd, contentDescription = null, tint = AmberSkip, modifier = Modifier.size(22.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Paste Questions",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 420.dp)
                ) {
                    Text(
                        text = "Format: [Q1] Question: ... A: ... B: ... C: ... D: ... Correct: B Explanation: ... [/Q1]",
                        color = Slate400,
                        fontSize = 11.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Paste from clipboard
                        Button(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val item = clipboard.primaryClip?.getItemAt(0)
                                val text = item?.text?.toString() ?: ""
                                if (text.isNotBlank()) {
                                    rawInput = text
                                    errorMessage = null
                                    Toast.makeText(context, "Pasted from clipboard", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "Clipboard is empty", Toast.LENGTH_SHORT).show()
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Paste Clipboard", fontSize = 11.sp, color = AmberSkip)
                        }

                        // Load Sample
                        Button(
                            onClick = {
                                rawInput = SAMPLE_QUESTIONS_TEMPLATE
                                errorMessage = null
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Load Sample (3 Qs)", fontSize = 11.sp, color = Slate100)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = rawInput,
                        onValueChange = {
                            rawInput = it
                            errorMessage = null
                        },
                        placeholder = {
                            Text(
                                "Paste your questions here in [Q1]...[/Q1] format...",
                                fontSize = 12.sp,
                                color = Slate400
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100,
                            focusedBorderColor = AmberSkip,
                            unfocusedBorderColor = Slate700,
                            focusedContainerColor = Slate950,
                            unfocusedContainerColor = Slate950
                        )
                    )

                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = errorMessage ?: "",
                            color = RoseClear,
                            fontSize = 11.sp
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (rawInput.isBlank()) {
                            errorMessage = "Please paste or enter questions in [Q1]...[/Q1] format."
                            return@Button
                        }
                        val success = viewModel.loadQuestionsFromText(rawInput)
                        if (success) {
                            Toast.makeText(context, "Questions loaded successfully!", Toast.LENGTH_SHORT).show()
                        } else {
                            errorMessage = "No valid [Q1]...[/Q1] questions found. Please check format."
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                ) {
                    Text("Load Questions", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setImportDialog(false) }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }

    // SUBMIT CONFIRMATION DIALOG
    if (state.showSubmitConfirmDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setSubmitConfirmDialog(false) },
            containerColor = Slate900,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Send, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Submit Test?", fontWeight = FontWeight.Bold, color = Slate100, fontSize = 18.sp)
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        "Are you sure you want to finish and submit your test?",
                        color = Slate100,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        color = Slate950,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("• Total Questions: ${state.totalQuestions}", color = Slate400, fontSize = 13.sp)
                            Text("• Answered: ${state.answeredCount}", color = EmeraldAccent, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            Text("• Unanswered: ${state.unansweredCount}", color = AmberSkip, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Once submitted, all correct answers and explanations will be revealed.",
                        color = Slate400,
                        fontSize = 12.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.submitTest() },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                ) {
                    Text("Submit Now", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setSubmitConfirmDialog(false) }) {
                    Text("Keep Attempting", color = Slate400)
                }
            }
        )
    }

    // UNANSWERED QUESTIONS DIALOG
    if (state.showUnansweredDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setUnansweredDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Question Grid (${state.answeredCount}/${state.totalQuestions} Answered)",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                val qList = (state.startQuestion..state.endQuestion).toList()
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 52.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 360.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(qList) { qNum ->
                        val ans = state.answers[qNum]
                        val isAnswered = !ans.isNullOrBlank()
                        val qItemInGrid = state.questions[qNum]

                        val (boxBg, boxBorder, textColor) = when {
                            state.isSubmitted && qItemInGrid != null -> {
                                val isCorrectQ = qItemInGrid.correctAnswer.isNotBlank() && qItemInGrid.correctAnswer.equals(ans?.trim(), ignoreCase = true)
                                if (isCorrectQ) {
                                    Triple(EmeraldAccent.copy(alpha = 0.2f), EmeraldAccent, EmeraldAccent)
                                } else if (isAnswered) {
                                    Triple(RoseClear.copy(alpha = 0.2f), RoseClear, RoseClear)
                                } else {
                                    Triple(AmberSkip.copy(alpha = 0.15f), AmberSkip.copy(alpha = 0.4f), AmberSkip)
                                }
                            }
                            isAnswered -> Triple(BlueSelected.copy(alpha = 0.25f), BlueAccent, BlueAccent)
                            else -> Triple(Slate800, Slate700, Slate400)
                        }

                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(boxBg)
                                .border(1.dp, boxBorder, RoundedCornerShape(10.dp))
                                .clickable { viewModel.jumpTo(qNum) },
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = qNum.toString(),
                                    color = textColor,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                if (isAnswered) {
                                    Text(
                                        text = ans ?: "",
                                        color = textColor,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { viewModel.setUnansweredDialog(false) }) {
                    Text("Close", color = BlueAccent, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    // EXPORT DIALOG
    if (state.showExportDialog) {
        var selectedFormat by remember { mutableStateOf("TXT") }
        val exportContent = remember(selectedFormat, state.answers, state.startQuestion, state.totalQuestions) {
            if (selectedFormat == "TXT") viewModel.generateTxtExport() else viewModel.generateCsvExport()
        }

        AlertDialog(
            onDismissRequest = { viewModel.setExportDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Export Answers",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { selectedFormat = "TXT" },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedFormat == "TXT") BlueAccent else Slate800
                            )
                        ) {
                            Text("TXT Format")
                        }
                        Button(
                            onClick = { selectedFormat = "CSV" },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedFormat == "CSV") BlueAccent else Slate800
                            )
                        ) {
                            Text("CSV Format")
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = if (selectedFormat == "TXT") "Standard 1-A format (easy to paste to ChatGPT):" else "CSV format for Excel / Google Sheets:",
                        color = Slate400,
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = Slate950,
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                    ) {
                        Text(
                            text = exportContent,
                            modifier = Modifier.padding(10.dp),
                            color = Slate100,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            fontSize = 12.sp
                        )
                    }
                }
            },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("MCQ Answers", exportContent))
                            Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                    ) {
                        Text("Copy", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, exportContent)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share MCQ Answers"))
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BlueAccent)
                    ) {
                        Text("Share", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setExportDialog(false) }) {
                    Text("Close", color = Slate400)
                }
            }
        )
    }

    // RANGE SETUP DIALOG
    if (state.showSetupDialog) {
        var startInput by remember { mutableStateOf(state.startQuestion.toString()) }
        var totalInput by remember { mutableStateOf(state.totalQuestions.toString()) }

        AlertDialog(
            onDismissRequest = { viewModel.setSetupDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Question Range Setup",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = startInput,
                        onValueChange = { startInput = it },
                        label = { Text("Start Question Number") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100,
                            focusedBorderColor = BlueAccent,
                            unfocusedBorderColor = Slate700
                        )
                    )
                    OutlinedTextField(
                        value = totalInput,
                        onValueChange = { totalInput = it },
                        label = { Text("Total Number of Questions (1 - 500)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100,
                            focusedBorderColor = BlueAccent,
                            unfocusedBorderColor = Slate700
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val s = startInput.toIntOrNull() ?: 1
                        val t = totalInput.toIntOrNull() ?: 500
                        viewModel.updateRange(s, t, 4)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BlueAccent)
                ) {
                    Text("Apply Range")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setSetupDialog(false) }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }

    // CLEAR ALL CONFIRMATION DIALOG
    if (state.showClearAllDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setClearAllDialog(false) },
            containerColor = Slate900,
            title = {
                Text("Clear All Answers?", fontWeight = FontWeight.Bold, color = RoseClear)
            },
            text = {
                Text(
                    "This will delete all saved answers (${state.answeredCount} answered questions) and reset to question ${state.startQuestion}. This cannot be undone.",
                    color = Slate100
                )
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.clearAllAnswers() },
                    colors = ButtonDefaults.buttonColors(containerColor = RoseClear)
                ) {
                    Text("Yes, Clear All", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setClearAllDialog(false) }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }
}

// Simple Quadruple helper data class
data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
