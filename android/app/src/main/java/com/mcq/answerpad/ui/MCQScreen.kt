package com.mcq.answerpad.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.media.ToneGenerator
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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

object AndroidEffects {
    private var toneGen: ToneGenerator? = null

    init {
        try {
            toneGen = ToneGenerator(AudioManager.STREAM_MUSIC, 70)
        } catch (e: Exception) {}
    }

    fun playClick(context: Context, sound: Boolean, haptic: Boolean) {
        if (sound) {
            try { toneGen?.startTone(ToneGenerator.TONE_PROP_BEEP, 35) } catch (e: Exception) {}
        }
        if (haptic) triggerVibration(context, 20)
    }

    fun playSelect(context: Context, sound: Boolean, haptic: Boolean) {
        if (sound) {
            try { toneGen?.startTone(ToneGenerator.TONE_PROP_ACK, 45) } catch (e: Exception) {}
        }
        if (haptic) triggerVibration(context, 35)
    }

    fun playMilestone(context: Context, sound: Boolean, haptic: Boolean) {
        if (sound) {
            try { toneGen?.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 120) } catch (e: Exception) {}
        }
        if (haptic) triggerVibrationPattern(context, longArrayOf(0, 40, 50, 40))
    }

    fun playVictory(context: Context, sound: Boolean, haptic: Boolean) {
        if (sound) {
            try { toneGen?.startTone(ToneGenerator.TONE_CDMA_CONFIRM, 180) } catch (e: Exception) {}
        }
        if (haptic) triggerVibrationPattern(context, longArrayOf(0, 50, 60, 90))
    }

    @Suppress("DEPRECATION")
    private fun triggerVibration(context: Context, ms: Long) {
        try {
            val vibrator = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? android.os.VibratorManager
                vm?.defaultVibrator
            } else {
                context.getSystemService(Context.VIBRATOR_SERVICE) as? android.os.Vibrator
            }

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                vibrator?.vibrate(android.os.VibrationEffect.createOneShot(ms, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                vibrator?.vibrate(ms)
            }
        } catch (e: Exception) {}
    }

    @Suppress("DEPRECATION")
    private fun triggerVibrationPattern(context: Context, pattern: LongArray) {
        try {
            val vibrator = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? android.os.VibratorManager
                vm?.defaultVibrator
            } else {
                context.getSystemService(Context.VIBRATOR_SERVICE) as? android.os.Vibrator
            }

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                vibrator?.vibrate(android.os.VibrationEffect.createWaveform(pattern, -1))
            } else {
                vibrator?.vibrate(pattern, -1)
            }
        } catch (e: Exception) {}
    }
}

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

private fun formatTime(sec: Int): String {
    val m = sec / 60
    val s = sec % 60
    return String.format("%02d:%02d", m, s)
}

private fun formatBank(sec: Int): String {
    val isNeg = sec < 0
    val abs = kotlin.math.abs(sec)
    val m = abs / 60
    val s = abs % 60
    val sign = if (isNeg) "-" else "+"
    return String.format("%s%02d:%02d", sign, m, s)
}

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
                        fontSize = 17.sp,
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
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                        modifier = Modifier.padding(end = 4.dp)
                    ) {
                        Icon(
                            Icons.Default.PostAdd,
                            contentDescription = "Paste Questions",
                            modifier = Modifier.size(15.dp),
                            tint = AmberSkip
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text("Paste Qs", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    // Submit Test or Retake Button
                    if (!state.isSubmitted) {
                        Button(
                            onClick = { viewModel.setSubmitConfirmDialog(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                            modifier = Modifier.padding(end = 4.dp)
                        ) {
                            Icon(
                                Icons.Default.Send,
                                contentDescription = "Submit Test",
                                modifier = Modifier.size(13.dp),
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Submit", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    } else {
                        Button(
                            onClick = { viewModel.retakeTest() },
                            colors = ButtonDefaults.buttonColors(containerColor = BlueAccent),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                            modifier = Modifier.padding(end = 4.dp)
                        ) {
                            Icon(
                                Icons.Default.Refresh,
                                contentDescription = "Retake Test",
                                modifier = Modifier.size(13.dp),
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Retake", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }

                    // Analytics trigger
                    IconButton(onClick = { viewModel.setPerformanceDashboard(true) }) {
                        Icon(Icons.Default.EmojiEvents, contentDescription = "Analytics", tint = AmberSkip)
                    }

                    // Export
                    IconButton(onClick = { viewModel.setExportDialog(true) }) {
                        Icon(Icons.Default.Share, contentDescription = "Export", tint = Slate400)
                    }

                    // Settings
                    IconButton(onClick = { viewModel.setSetupDialog(true) }) {
                        Icon(Icons.Default.Tune, contentDescription = "Settings", tint = Slate400)
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
                .padding(horizontal = 12.dp, vertical = 4.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // EVALUATION SCORE BANNER (Shown at top post-submission)
            if (state.isSubmitted) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
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
                                fontSize = 14.sp,
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
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Surface(
                                modifier = Modifier.weight(1f),
                                color = EmeraldAccent.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldAccent.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "✓ ${state.correctCount} Correct",
                                    color = EmeraldAccent,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }

                            Surface(
                                modifier = Modifier.weight(1f),
                                color = RoseClear.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, RoseClear.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "✗ ${state.incorrectCount} Wrong",
                                    color = RoseClear,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }

                            Surface(
                                modifier = Modifier.weight(1f),
                                color = AmberSkip.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, AmberSkip.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "○ ${state.unattemptedEvaluatedCount} Skipped",
                                    color = AmberSkip,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }
                        }
                    }
                }
            }

            // PRIMARY STATUS CARD (Adaptive Time Bank + Targets + Streak)
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Question Counter
                        Text(
                            text = "Question ${state.currentQuestion} / ${state.endQuestion}",
                            modifier = Modifier.weight(1f, fill = false),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = BlueAccent,
                            maxLines = 1,
                            softWrap = false
                        )

                        Spacer(modifier = Modifier.width(4.dp))

                        // TIME BANK DUAL BADGE
                        if (!state.isSubmitted) {
                            Surface(
                                color = Slate950,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = if (state.isTimerPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                                        contentDescription = "Timer Pause",
                                        tint = if (state.isTimerPaused) AmberSkip else Slate400,
                                        modifier = Modifier
                                            .size(14.dp)
                                            .clickable { viewModel.toggleTimerPause() }
                                    )
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(
                                        text = if (state.isOvertime) "+${formatTime(state.overtimeDisplay)}" else formatTime(state.countdownDisplay),
                                        color = if (state.isOvertime) RoseClear else Slate100,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(text = " | ", color = Slate700, fontSize = 10.sp)
                                    Text(
                                        text = formatBank(state.globalBankBalance),
                                        color = if (state.globalBankBalance >= 0) EmeraldAccent else RoseClear,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.width(4.dp))

                        // Target pill & Streak
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                color = Slate950,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
                                modifier = Modifier.clickable { viewModel.setSetupDialog(true) }
                            ) {
                                Text(
                                    text = "🎯 ${state.processedQuestions.size}/${state.targetCount}",
                                    color = EmeraldAccent,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(4.dp))
                            Surface(
                                color = Slate950,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
                                modifier = Modifier.clickable { viewModel.setPerformanceDashboard(true) }
                            ) {
                                Text(
                                    text = "🔥 ${state.currentStreak}",
                                    color = AmberSkip,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
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
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            softWrap = false
                        )
                        Button(
                            onClick = { viewModel.setUnansweredDialog(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Unanswered: ${state.unansweredCount}",
                                color = AmberSkip,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
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
                            .height(3.dp)
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
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "Q${state.currentQuestion}.",
                            color = BlueAccent,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = qItem.questionText,
                            color = Slate100,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            lineHeight = 18.sp
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            // MCQ OPTIONS A, B, C, D
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                options.forEach { opt ->
                    val isSelected = state.currentAnswer == opt
                    val optText = qItem?.options?.get(opt)
                    val isOptionCorrect = state.isSubmitted && qItem != null && qItem.correctAnswer.equals(opt, ignoreCase = true)
                    val isOptionWrongSelected = state.isSubmitted && isSelected && !isOptionCorrect

                    val (containerColor, contentColor, borderColor, borderWidth) = when {
                        !state.isSubmitted -> {
                            if (isSelected) {
                                Quadruple(BlueSelected, Color.White, BlueAccent, 2.dp)
                            } else {
                                Quadruple(Slate900, Slate100, Slate800, 1.dp)
                            }
                        }
                        isOptionCorrect -> {
                            Quadruple(EmeraldAccent.copy(alpha = 0.25f), Color.White, EmeraldAccent, 2.dp)
                        }
                        isOptionWrongSelected -> {
                            Quadruple(RoseClear.copy(alpha = 0.25f), Color.White, RoseClear, 2.dp)
                        }
                        else -> {
                            Quadruple(Slate900.copy(alpha = 0.6f), Slate400, Slate800, 1.dp)
                        }
                    }

                    Button(
                        onClick = {
                            if (!state.isSubmitted) {
                                AndroidEffects.playSelect(context, state.soundEnabled, state.hapticEnabled)
                                viewModel.answerCurrent(opt)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .defaultMinSize(minHeight = 48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = containerColor,
                            contentColor = contentColor
                        ),
                        border = androidx.compose.foundation.BorderStroke(borderWidth, borderColor),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
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
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = opt,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Black,
                                            color = contentColor
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                if (!optText.isNullOrBlank()) {
                                    Text(
                                        text = optText,
                                        fontSize = 13.sp,
                                        fontWeight = if (isSelected || isOptionCorrect) FontWeight.Bold else FontWeight.Normal,
                                        color = contentColor,
                                        textAlign = TextAlign.Start,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                } else {
                                    Text(
                                        text = "Option $opt",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = contentColor
                                    )
                                }
                            }

                            if (!state.isSubmitted && isSelected) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = "Selected",
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            } else if (state.isSubmitted) {
                                if (isOptionCorrect) {
                                    Icon(
                                        Icons.Default.CheckCircle,
                                        contentDescription = "Correct",
                                        tint = EmeraldAccent,
                                        modifier = Modifier.size(18.dp)
                                    )
                                } else if (isOptionWrongSelected) {
                                    Icon(
                                        Icons.Default.Cancel,
                                        contentDescription = "Wrong",
                                        tint = RoseClear,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // POST-SUBMISSION EXPLANATION
            if (state.isSubmitted && qItem != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldAccent.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = EmeraldAccent, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Correct Answer: ${qItem.correctAnswer}",
                                color = EmeraldAccent,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        if (qItem.explanation.isNotBlank()) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = qItem.explanation,
                                color = Slate100,
                                fontSize = 12.sp,
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }

            // SKIP BUTTON (ATTEMPT MODE ONLY)
            if (!state.isSubmitted) {
                Spacer(modifier = Modifier.height(6.dp))
                Button(
                    onClick = {
                        AndroidEffects.playClick(context, state.soundEnabled, state.hapticEnabled)
                        viewModel.skipCurrent()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Slate900,
                        contentColor = AmberSkip
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                ) {
                    Icon(
                        Icons.Default.FastForward,
                        contentDescription = "Skip",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Skip Question",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // BOTTOM NAVIGATION CONTROLS
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = {
                        AndroidEffects.playClick(context, state.soundEnabled, state.hapticEnabled)
                        viewModel.previousQuestion()
                    },
                    enabled = state.currentQuestion > state.startQuestion,
                    modifier = Modifier
                        .weight(1f)
                        .height(42.dp),
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Slate900, contentColor = Slate100),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, modifier = Modifier.size(15.dp))
                    Spacer(modifier = Modifier.width(3.dp))
                    Text("Prev", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                if (!state.isSubmitted) {
                    Button(
                        onClick = {
                            AndroidEffects.playClick(context, state.soundEnabled, state.hapticEnabled)
                            viewModel.clearCurrentAnswer()
                        },
                        enabled = !state.currentAnswer.isNullOrBlank(),
                        modifier = Modifier
                            .weight(1.1f)
                            .height(42.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Slate900, contentColor = RoseClear),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                    ) {
                        Text("Clear Ans", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(
                        onClick = {
                            AndroidEffects.playClick(context, state.soundEnabled, state.hapticEnabled)
                            viewModel.setUnansweredDialog(true)
                        },
                        modifier = Modifier
                            .weight(1.1f)
                            .height(42.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Slate900, contentColor = AmberSkip),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                    ) {
                        Text("Review All", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Button(
                    onClick = {
                        AndroidEffects.playClick(context, state.soundEnabled, state.hapticEnabled)
                        viewModel.nextQuestion()
                    },
                    enabled = state.currentQuestion < state.endQuestion,
                    modifier = Modifier
                        .weight(1f)
                        .height(42.dp),
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Slate900, contentColor = Slate100),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                ) {
                    Text("Next", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(3.dp))
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(15.dp))
                }
            }
            Spacer(modifier = Modifier.height(14.dp))
        }
    }

    // TARGET COMPLETED DIALOG
    if (state.showTargetCompletedDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setTargetCompletedDialog(false) },
            containerColor = Slate900,
            title = {
                Text("🎯 Session Target Completed!", fontWeight = FontWeight.Bold, color = EmeraldAccent, fontSize = 18.sp)
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        "${state.processedQuestions.size} questions processed in this practice run (+${state.totalXP} Total XP).",
                        color = Slate100,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("What would you like to do next?", color = Slate400, fontSize = 12.sp)
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.continueTarget(state.processedQuestions.size + 10) },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                ) {
                    Text("+10 Qs More", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setTargetCompletedDialog(false) }) {
                    Text("Pause & Save", color = AmberSkip)
                }
            }
        )
    }

    // PERFORMANCE DASHBOARD DIALOG
    if (state.showPerformanceDashboard) {
        AlertDialog(
            onDismissRequest = { viewModel.setPerformanceDashboard(false) },
            containerColor = Slate900,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = AmberSkip, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Performance & Analytics", fontWeight = FontWeight.Bold, color = BlueAccent, fontSize = 17.sp)
                }
            },
            text = {
                val totalSpent = state.questionTimings.values.sum()
                val avgSec = if (state.visitedQuestions.isNotEmpty()) totalSpent / state.visitedQuestions.size else 0
                val xpInCurrentLevel = state.totalXP % 100
                val progressFloat = (xpInCurrentLevel / 100f).coerceIn(0f, 1f)

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 480.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Level & XP Progress Card
                    Surface(color = Slate950, shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Level ${state.level}", color = AmberSkip, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text("${state.totalXP} Total XP", color = Slate400, fontSize = 12.sp)
                            }
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(Slate800)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(fraction = progressFloat)
                                        .fillMaxHeight()
                                        .clip(RoundedCornerShape(3.dp))
                                        .background(AmberSkip)
                                )
                            }
                            Spacer(modifier = Modifier.height(3.dp))
                            Text("$xpInCurrentLevel / 100 XP to Level ${state.level + 1}", color = Slate400, fontSize = 10.sp)
                        }
                    }

                    // Streaks & Accuracy
                    Surface(color = Slate950, shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Streak & Accuracy", color = Slate100, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Current Streak:", color = Slate400, fontSize = 12.sp)
                                Text("${state.currentStreak} 🔥 (Best: ${state.personalBestStreak})", color = AmberSkip, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Accuracy:", color = Slate400, fontSize = 12.sp)
                                Text("${state.sessionAccuracy}%", color = EmeraldAccent, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Score Breakdown:", color = Slate400, fontSize = 12.sp)
                                Text("${state.correctCount} Correct / ${state.incorrectCount} Wrong", color = Slate100, fontSize = 12.sp)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Questions Processed:", color = Slate400, fontSize = 12.sp)
                                Text("${state.processedQuestions.size} / ${state.totalQuestions}", color = Slate100, fontSize = 12.sp)
                            }
                        }
                    }

                    // Time & Pacing
                    Surface(color = Slate950, shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Pacing & Time Bank", color = Slate100, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Avg Time / Question:", color = Slate400, fontSize = 12.sp)
                                Text("${avgSec}s", color = Slate100, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Bank Balance:", color = Slate400, fontSize = 12.sp)
                                val bankColor = if (state.globalBankBalance >= 0) EmeraldAccent else RoseClear
                                Text(formatBank(state.globalBankBalance), color = bankColor, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }

                    // Achievements Shelf
                    Surface(color = Slate950, shape = RoundedCornerShape(10.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Achievements", color = Slate100, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            val ach1 = state.processedQuestions.isNotEmpty()
                            val ach2 = state.currentStreak >= 10 || state.personalBestStreak >= 10
                            val ach3 = state.globalBankBalance > 0
                            val ach4 = state.sessionAccuracy >= 80 && state.answeredCount >= 5

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(if (ach1) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked, contentDescription = null, tint = if (ach1) EmeraldAccent else Slate600, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("First Step: Processed first question", fontSize = 11.sp, color = if (ach1) Slate100 else Slate500)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(if (ach2) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked, contentDescription = null, tint = if (ach2) EmeraldAccent else Slate600, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Streak Pioneer: Reached a 10+ question streak", fontSize = 11.sp, color = if (ach2) Slate100 else Slate500)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(if (ach3) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked, contentDescription = null, tint = if (ach3) EmeraldAccent else Slate600, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Time Master: Positive time bank reserve", fontSize = 11.sp, color = if (ach3) Slate100 else Slate500)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(if (ach4) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked, contentDescription = null, tint = if (ach4) EmeraldAccent else Slate600, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Sharp Shooter: 80%+ accuracy", fontSize = 11.sp, color = if (ach4) Slate100 else Slate500)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { viewModel.setPerformanceDashboard(false) }) {
                    Text("Close", color = BlueAccent, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    // EXPORT DIALOG WITH MISTAKES-ONLY EXPORT & SCROLLABLE PREVIEW
    if (state.showExportDialog) {
        var selectedFormat by remember { mutableStateOf("CSV") }
        val exportContent = remember(selectedFormat, state.answers, state.startQuestion, state.totalQuestions, state.isSubmitted, state.questions) {
            when (selectedFormat) {
                "CSV" -> viewModel.generateCsvExport(includeEvaluation = true)
                "MISTAKES" -> viewModel.generateIncorrectQuestionsOnlyTxt()
                else -> viewModel.generateTxtExport(includeEvaluation = true)
            }
        }

        AlertDialog(
            onDismissRequest = { viewModel.setExportDialog(false) },
            containerColor = Slate900,
            title = {
                Text(text = "Export Answers & Evaluation", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Slate100)
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Button(
                            onClick = { selectedFormat = "CSV" },
                            modifier = Modifier.weight(1.1f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = if (selectedFormat == "CSV") BlueAccent else Slate800)
                        ) {
                            Text("CSV (Detailed)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = { selectedFormat = "TXT" },
                            modifier = Modifier.weight(0.9f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = if (selectedFormat == "TXT") BlueAccent else Slate800)
                        ) {
                            Text("TXT", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = { selectedFormat = "MISTAKES" },
                            modifier = Modifier.weight(1.2f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = if (selectedFormat == "MISTAKES") AmberSkip else Slate800)
                        ) {
                            Text("Mistakes TXT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (selectedFormat == "MISTAKES") Slate950 else AmberSkip)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = when (selectedFormat) {
                            "CSV" -> "Includes: Question, Selected Answer, Correct Answer, Result, Explanation"
                            "MISTAKES" -> "Mistakes-only questions formatted in [Q1]...[/Q1] format for re-import"
                            else -> "Text summary with question responses and answer keys"
                        },
                        fontSize = 10.sp,
                        color = AmberSkip,
                        lineHeight = 13.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = Slate950,
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                                .horizontalScroll(rememberScrollState())
                                .padding(10.dp)
                        ) {
                            Text(
                                text = if (exportContent.isBlank()) "No data available for this format." else exportContent,
                                color = Slate100,
                                fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("MCQ Export", exportContent))
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
                            context.startActivity(Intent.createChooser(sendIntent, "Share MCQ Export"))
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

    // RANGE & SETTINGS DIALOG (SCROLLABLE WITH SOUND & HAPTIC SWITCHES)
    if (state.showSetupDialog) {
        var startInput by remember { mutableStateOf(state.startQuestion.toString()) }
        var totalInput by remember { mutableStateOf(state.totalQuestions.toString()) }
        var baseTimeInput by remember { mutableStateOf(state.baseTimePerQuestion.toString()) }
        var targetInput by remember { mutableStateOf(state.targetCount.toString()) }
        var soundInput by remember { mutableStateOf(state.soundEnabled) }
        var hapticInput by remember { mutableStateOf(state.hapticEnabled) }

        AlertDialog(
            onDismissRequest = { viewModel.setSetupDialog(false) },
            containerColor = Slate900,
            title = {
                Text(text = "App & Timer Settings", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Slate100)
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 440.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Sound Switch
                    Surface(color = Slate950, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Sound Effects", color = Slate100, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Text("Audio feedback on tap & milestones", color = Slate400, fontSize = 10.sp)
                            }
                            Switch(
                                checked = soundInput,
                                onCheckedChange = { soundInput = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = EmeraldAccent, checkedTrackColor = Slate800)
                            )
                        }
                    }

                    // Haptic Switch
                    Surface(color = Slate950, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Haptic Feedback", color = Slate100, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Text("Vibration on button taps & answers", color = Slate400, fontSize = 10.sp)
                            }
                            Switch(
                                checked = hapticInput,
                                onCheckedChange = { hapticInput = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = EmeraldAccent, checkedTrackColor = Slate800)
                            )
                        }
                    }

                    OutlinedTextField(
                        value = baseTimeInput,
                        onValueChange = { baseTimeInput = it },
                        label = { Text("Base Time / Question (sec)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Slate100, unfocusedTextColor = Slate100)
                    )
                    OutlinedTextField(
                        value = targetInput,
                        onValueChange = { targetInput = it },
                        label = { Text("Session Target (Questions)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Slate100, unfocusedTextColor = Slate100)
                    )
                    OutlinedTextField(
                        value = startInput,
                        onValueChange = { startInput = it },
                        label = { Text("Start Question #") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Slate100, unfocusedTextColor = Slate100)
                    )
                    OutlinedTextField(
                        value = totalInput,
                        onValueChange = { totalInput = it },
                        label = { Text("Total Questions (1-500)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Slate100, unfocusedTextColor = Slate100)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val s = startInput.toIntOrNull() ?: 1
                        val t = totalInput.toIntOrNull() ?: 500
                        val b = baseTimeInput.toIntOrNull() ?: 60
                        val tg = targetInput.toIntOrNull() ?: 10
                        viewModel.updateRangeAndSettings(s, t, b, tg, soundInput, hapticInput)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BlueAccent)
                ) {
                    Text("Save Settings")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setSetupDialog(false) }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }

    // PASTE QUESTIONS DIALOG
    if (state.showImportDialog) {
        var rawInput by remember { mutableStateOf("") }
        var errorMessage by remember { mutableStateOf<String?>(null) }

        AlertDialog(
            onDismissRequest = { viewModel.setImportDialog(false) },
            containerColor = Slate900,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.PostAdd, contentDescription = null, tint = AmberSkip, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Paste Questions", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Slate100)
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth().heightIn(max = 380.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Button(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val item = clipboard.primaryClip?.getItemAt(0)
                                val text = item?.text?.toString() ?: ""
                                if (text.isNotBlank()) {
                                    rawInput = text
                                    errorMessage = null
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Paste Clipboard", fontSize = 11.sp, color = AmberSkip)
                        }

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
                            Text("Sample (3 Qs)", fontSize = 11.sp, color = Slate100)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    OutlinedTextField(
                        value = rawInput,
                        onValueChange = {
                            rawInput = it
                            errorMessage = null
                        },
                        placeholder = { Text("Paste [Q1]...[/Q1] format...", fontSize = 12.sp, color = Slate400) },
                        modifier = Modifier.fillMaxWidth().weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Slate100, unfocusedTextColor = Slate100)
                    )

                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = errorMessage ?: "", color = RoseClear, fontSize = 11.sp)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val success = viewModel.loadQuestionsFromText(rawInput)
                        if (success) {
                            Toast.makeText(context, "Questions loaded!", Toast.LENGTH_SHORT).show()
                        } else {
                            errorMessage = "No valid [Q1] questions found."
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                ) {
                    Text("Load", color = Color.White, fontWeight = FontWeight.Bold)
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
                Text("Submit Test for Evaluation?", fontWeight = FontWeight.Bold, color = Slate100, fontSize = 18.sp)
            },
            text = {
                Text("Are you sure? Once submitted, all answers and explanations will be revealed.", color = Slate100, fontSize = 13.sp)
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
                Text("Question Grid (${state.answeredCount}/${state.totalQuestions})", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Slate100)
            },
            text = {
                val qList = (state.startQuestion..state.endQuestion).toList()
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 48.dp),
                    modifier = Modifier.fillMaxWidth().heightIn(max = 340.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(qList) { qNum ->
                        val ans = state.answers[qNum]
                        val isAns = !ans.isNullOrBlank()

                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isAns) BlueSelected.copy(alpha = 0.25f) else Slate800)
                                .border(1.dp, if (isAns) BlueAccent else Slate700, RoundedCornerShape(8.dp))
                                .clickable { viewModel.jumpTo(qNum) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = qNum.toString(), color = if (isAns) BlueAccent else Slate400, fontSize = 12.sp, fontWeight = FontWeight.Bold)
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

    // CLEAR ALL CONFIRMATION DIALOG
    if (state.showClearAllDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setClearAllDialog(false) },
            containerColor = Slate900,
            title = { Text("Clear All Answers?", fontWeight = FontWeight.Bold, color = RoseClear) },
            text = { Text("This will reset all answers, timings, and progress. This cannot be undone.", color = Slate100) },
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

data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
