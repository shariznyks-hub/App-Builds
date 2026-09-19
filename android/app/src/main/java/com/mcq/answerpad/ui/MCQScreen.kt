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
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mcq.answerpad.MCQViewModel
import com.mcq.answerpad.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MCQScreen(viewModel: MCQViewModel) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val options = listOf("A", "B", "C", "D")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "MCQ Answer Pad",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                },
                actions = {
                    IconButton(onClick = { viewModel.setSetupDialog(true) }) {
                        Icon(Icons.Default.Tune, contentDescription = "Range Settings")
                    }
                    IconButton(onClick = { viewModel.setExportDialog(true) }) {
                        Icon(Icons.Default.Share, contentDescription = "Export")
                    }
                    IconButton(onClick = { viewModel.setClearAllDialog(true) }) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = "Clear All")
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
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // PROGRESS & STATS BAR
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Question ${state.currentQuestion} / ${state.endQuestion}",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = BlueAccent
                        )
                        
                        // Current saved answer badge
                        if (!state.currentAnswer.isNullOrBlank()) {
                            Surface(
                                color = EmeraldAccent.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(12.dp),
                                border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldAccent)
                            ) {
                                Text(
                                    text = "Saved: ${state.currentAnswer}",
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = EmeraldAccent
                                )
                            }
                        } else {
                            Surface(
                                color = Slate800,
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    text = "Unanswered",
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 14.sp,
                                    color = Slate400
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Answered: ${state.answeredCount}",
                            color = EmeraldAccent,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 16.sp
                        )
                        Button(
                            onClick = { viewModel.setUnansweredDialog(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(12.dp),
                            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "Unanswered: ${state.unansweredCount}",
                                color = AmberSkip,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    val progress = if (state.totalQuestions > 0) state.answeredCount.toFloat() / state.totalQuestions else 0f
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = BlueAccent,
                        trackColor = Slate800
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // MAIN MCQ BUTTONS (OCCUPIES BULK OF SCREEN)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                options.forEach { opt ->
                    val isSelected = state.currentAnswer == opt
                    Button(
                        onClick = { viewModel.answerCurrent(opt) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(18.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) BlueSelected else Slate900,
                            contentColor = if (isSelected) Color.White else Slate100
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            width = if (isSelected) 3.dp else 1.5.dp,
                            color = if (isSelected) BlueAccent else Slate700
                        )
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = opt,
                                fontSize = 42.sp,
                                fontWeight = FontWeight.Black
                            )
                            if (isSelected) {
                                Spacer(modifier = Modifier.width(12.dp))
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Selected",
                                    tint = Color.White,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // SKIP BUTTON (LARGE, 1 TAP)
            Button(
                onClick = { viewModel.skipCurrent() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AmberSkip.copy(alpha = 0.18f),
                    contentColor = AmberSkip
                ),
                border = androidx.compose.foundation.BorderStroke(2.dp, AmberSkip)
            ) {
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Redo, contentDescription = null, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "SKIP",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // NAVIGATION BAR
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = { viewModel.previousQuestion() },
                    enabled = state.currentQuestion > state.startQuestion,
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Slate900,
                        contentColor = Slate100,
                        disabledContainerColor = Slate900.copy(alpha = 0.5f),
                        disabledContentColor = Slate700
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Prev", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = { viewModel.clearCurrentAnswer() },
                    enabled = !state.currentAnswer.isNullOrBlank(),
                    modifier = Modifier
                        .weight(1.2f)
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = RoseClear.copy(alpha = 0.15f),
                        contentColor = RoseClear,
                        disabledContainerColor = Slate900.copy(alpha = 0.5f),
                        disabledContentColor = Slate700
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (!state.currentAnswer.isNullOrBlank()) RoseClear.copy(alpha = 0.4f) else Slate700)
                ) {
                    Icon(Icons.Default.Clear, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Clear Ans", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = { viewModel.nextQuestion() },
                    enabled = state.currentQuestion < state.endQuestion,
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Slate900,
                        contentColor = Slate100,
                        disabledContainerColor = Slate900.copy(alpha = 0.5f),
                        disabledContentColor = Slate700
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate700)
                ) {
                    Text("Next", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null)
                }
            }
        }
    }

    // UNANSWERED QUESTIONS DIALOG
    if (state.showUnansweredDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setUnansweredDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Unanswered Questions (${state.unansweredCount})",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                if (state.unansweredList.isEmpty()) {
                    Text(
                        "All questions in range have been answered!",
                        color = EmeraldAccent,
                        fontSize = 16.sp
                    )
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = 64.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 380.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(state.unansweredList) { qNum ->
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Slate800)
                                    .border(1.dp, Slate700, RoundedCornerShape(12.dp))
                                    .clickable { viewModel.jumpTo(qNum) },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = qNum.toString(),
                                    color = AmberSkip,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
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
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { selectedFormat = "TXT" },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedFormat == "TXT") BlueAccent else Slate800
                            )
                        ) {
                            Text("TXT Format")
                        }
                        Button(
                            onClick = { selectedFormat = "CSV" },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedFormat == "CSV") BlueAccent else Slate800
                            )
                        ) {
                            Text("CSV Format")
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = if (selectedFormat == "TXT") "Standard 1-A format (easy to paste to ChatGPT):" else "CSV format for Excel / Google Sheets:",
                        color = Slate400,
                        fontSize = 13.sp
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
                        Text(
                            text = exportContent,
                            modifier = Modifier.padding(12.dp),
                            color = Slate100,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            fontSize = 13.sp
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
        var optCount by remember { mutableIntStateOf(state.optionsCount) }

        AlertDialog(
            onDismissRequest = { viewModel.setSetupDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Question Range Setup",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Options per question:", color = Slate100, fontSize = 15.sp)
                        Surface(
                            color = BlueAccent.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BlueAccent)
                        ) {
                            Text(
                                text = "A - D (4 choices)",
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                color = Slate100,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
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
