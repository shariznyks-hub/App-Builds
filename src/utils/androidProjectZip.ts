import JSZip from 'jszip';
import { downloadFile } from './exportUtils';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MCQAnswerPad"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  );

  // App module
  const app = zip.folder('app');
  app?.file(
    'build.gradle.kts',
    `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.mcq.answerpad"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mcq.answerpad"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
}
`
  );

  // AndroidManifest.xml
  const main = app?.folder('src')?.folder('main');
  main?.file(
    'AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:label="MCQ Answer Pad"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  );

  // Kotlin source
  const javaPkg = main?.folder('java')?.folder('com')?.folder('mcq')?.folder('answerpad');
  
  javaPkg?.file(
    'MainActivity.kt',
    `package com.mcq.answerpad

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.mcq.answerpad.ui.MCQScreen
import com.mcq.answerpad.ui.theme.MCQAnswerPadTheme

class MainActivity : ComponentActivity() {
    private val viewModel: MCQViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MCQAnswerPadTheme {
                MCQScreen(viewModel = viewModel)
            }
        }
    }
}
`
  );

  javaPkg?.file(
    'MCQViewModel.kt',
    `package com.mcq.answerpad

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import org.json.JSONArray
import org.json.JSONObject

data class MCQQuestion(
    val number: Int,
    val questionText: String,
    val options: Map<String, String> = emptyMap(),
    val correctAnswer: String = "",
    val explanation: String = ""
)

data class MCQUiState(
    val startQuestion: Int = 1,
    val totalQuestions: Int = 500,
    val currentQuestion: Int = 1,
    val answers: Map<Int, String> = emptyMap(),
    val optionsCount: Int = 4,
    val showUnansweredDialog: Boolean = false,
    val showExportDialog: Boolean = false,
    val showClearAllDialog: Boolean = false,
    val showSetupDialog: Boolean = false,
    val showImportDialog: Boolean = false,
    val showSubmitConfirmDialog: Boolean = false,
    val questions: Map<Int, MCQQuestion> = emptyMap(),
    val isSubmitted: Boolean = false
) {
    val endQuestion: Int get() = startQuestion + totalQuestions - 1
    val answeredCount: Int get() = answers.count { it.key in startQuestion..endQuestion && it.value.isNotBlank() }
    val unansweredCount: Int get() = totalQuestions - answeredCount
    val currentAnswer: String? get() = answers[currentQuestion]
    val currentQuestionItem: MCQQuestion? get() = questions[currentQuestion]
    
    val unansweredList: List<Int> get() {
        val list = mutableListOf<Int>()
        for (q in startQuestion..endQuestion) {
            if (answers[q].isNullOrBlank()) {
                list.add(q)
            }
        }
        return list
    }

    val correctCount: Int get() = answers.count { (q, ans) ->
        val item = questions[q]
        item != null && item.correctAnswer.isNotBlank() && item.correctAnswer.equals(ans.trim(), ignoreCase = true)
    }

    val incorrectCount: Int get() = answers.count { (q, ans) ->
        val item = questions[q]
        item != null && item.correctAnswer.isNotBlank() && !item.correctAnswer.equals(ans.trim(), ignoreCase = true)
    }

    val unattemptedEvaluatedCount: Int get() {
        return questions.count { (q, _) -> answers[q].isNullOrBlank() }
    }

    val finalScorePercentage: Int get() {
        val total = if (questions.isNotEmpty()) questions.size else totalQuestions
        return if (total > 0) ((correctCount.toFloat() / total) * 100).toInt() else 0
    }
}

class MCQViewModel(application: Application) : AndroidViewModel(application) {
    private val prefs = application.getSharedPreferences("mcq_answer_pad_prefs", Context.MODE_PRIVATE)

    private val _uiState = MutableStateFlow(loadInitialState())
    val uiState: StateFlow<MCQUiState> = _uiState.asStateFlow()

    private fun loadInitialState(): MCQUiState {
        val start = prefs.getInt("start_question", 1)
        val total = prefs.getInt("total_questions", 500)
        val current = prefs.getInt("current_question", start)
        val optionsCount = prefs.getInt("options_count", 4)
        val isSubmitted = prefs.getBoolean("is_submitted", false)

        val answersMap = mutableMapOf<Int, String>()
        val answersJson = prefs.getString("answers_json", null)
        if (!answersJson.isNullOrBlank()) {
            try {
                val json = JSONObject(answersJson)
                val keys = json.keys()
                while (keys.hasNext()) {
                    val key = keys.next()
                    val qNum = key.toIntOrNull()
                    if (qNum != null) {
                        answersMap[qNum] = json.getString(key)
                    }
                }
            } catch (e: Exception) {
                // ignore
            }
        }

        val questionsMap = mutableMapOf<Int, MCQQuestion>()
        val questionsJson = prefs.getString("questions_json", null)
        if (!questionsJson.isNullOrBlank()) {
            try {
                val arr = JSONArray(questionsJson)
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    val num = obj.getInt("number")
                    val qText = obj.getString("questionText")
                    val optObj = obj.getJSONObject("options")
                    val opts = mutableMapOf<String, String>()
                    val keys = optObj.keys()
                    while (keys.hasNext()) {
                        val k = keys.next()
                        opts[k] = optObj.getString(k)
                    }
                    val corr = obj.optString("correctAnswer", "")
                    val exp = obj.optString("explanation", "")
                    questionsMap[num] = MCQQuestion(num, qText, opts, corr, exp)
                }
            } catch (e: Exception) {
                // ignore
            }
        }

        val effectiveTotal = if (questionsMap.isNotEmpty()) questionsMap.size else total
        val effectiveStart = if (questionsMap.isNotEmpty()) (questionsMap.keys.minOrNull() ?: start) else start

        return MCQUiState(
            startQuestion = effectiveStart,
            totalQuestions = effectiveTotal,
            currentQuestion = current.coerceIn(effectiveStart, effectiveStart + effectiveTotal - 1),
            answers = answersMap,
            optionsCount = optionsCount,
            questions = questionsMap,
            isSubmitted = isSubmitted
        )
    }

    private fun persistState() {
        val state = _uiState.value
        val json = JSONObject()
        state.answers.forEach { (q, ans) ->
            json.put(q.toString(), ans)
        }

        val qArr = JSONArray()
        state.questions.values.forEach { q ->
            val obj = JSONObject()
            obj.put("number", q.number)
            obj.put("questionText", q.questionText)
            val optObj = JSONObject()
            q.options.forEach { (k, v) -> optObj.put(k, v) }
            obj.put("options", optObj)
            obj.put("correctAnswer", q.correctAnswer)
            obj.put("explanation", q.explanation)
            qArr.put(obj)
        }

        prefs.edit()
            .putInt("start_question", state.startQuestion)
            .putInt("total_questions", state.totalQuestions)
            .putInt("current_question", state.currentQuestion)
            .putInt("options_count", state.optionsCount)
            .putString("answers_json", json.toString())
            .putString("questions_json", qArr.toString())
            .putBoolean("is_submitted", state.isSubmitted)
            .apply()
    }

    fun answerCurrent(option: String) {
        if (_uiState.value.isSubmitted) return
        _uiState.update { state ->
            val updated = state.answers.toMutableMap()
            updated[state.currentQuestion] = option
            val nextQ = if (state.currentQuestion < state.endQuestion) state.currentQuestion + 1 else state.currentQuestion
            state.copy(answers = updated, currentQuestion = nextQ)
        }
        persistState()
    }

    fun skipCurrent() {
        _uiState.update { state ->
            val nextQ = if (state.currentQuestion < state.endQuestion) state.currentQuestion + 1 else state.currentQuestion
            state.copy(currentQuestion = nextQ)
        }
        persistState()
    }

    fun nextQuestion() {
        _uiState.update { state ->
            if (state.currentQuestion < state.endQuestion) {
                state.copy(currentQuestion = state.currentQuestion + 1)
            } else state
        }
        persistState()
    }

    fun previousQuestion() {
        _uiState.update { state ->
            if (state.currentQuestion > state.startQuestion) {
                state.copy(currentQuestion = state.currentQuestion - 1)
            } else state
        }
        persistState()
    }

    fun jumpTo(questionNumber: Int) {
        _uiState.update { state ->
            val clamped = questionNumber.coerceIn(state.startQuestion, state.endQuestion)
            state.copy(currentQuestion = clamped, showUnansweredDialog = false)
        }
        persistState()
    }

    fun clearCurrentAnswer() {
        if (_uiState.value.isSubmitted) return
        _uiState.update { state ->
            val updated = state.answers.toMutableMap()
            updated.remove(state.currentQuestion)
            state.copy(answers = updated)
        }
        persistState()
    }

    fun clearAllAnswers() {
        _uiState.update { state ->
            state.copy(
                answers = emptyMap(),
                currentQuestion = state.startQuestion,
                showClearAllDialog = false,
                isSubmitted = false
            )
        }
        persistState()
    }

    fun updateRange(start: Int, total: Int, options: Int) {
        val validStart = start.coerceAtLeast(1)
        val validTotal = total.coerceIn(1, 500)
        _uiState.update { state ->
            state.copy(
                startQuestion = validStart,
                totalQuestions = validTotal,
                currentQuestion = validStart,
                optionsCount = options,
                showSetupDialog = false
            )
        }
        persistState()
    }

    fun parseQuestions(raw: String): List<MCQQuestion> {
        val list = mutableListOf<MCQQuestion>()
        val regex = Regex("\\\\[Q(\\\\d+)\\\\]([\\\\s\\\\S]*?)\\\\[/Q\\\\1\\\\]", RegexOption.IGNORE_CASE)
        val matches = regex.findAll(raw)

        for (m in matches) {
            val qNum = m.groupValues[1].toIntOrNull() ?: continue
            val body = m.groupValues[2]

            var qText = ""
            var optA = ""
            var optB = ""
            var optC = ""
            var optD = ""
            var correct = ""
            val explanationLines = mutableListOf<String>()

            val lines = body.lines()
            var currentSection = ""

            for (line in lines) {
                val trimmed = line.trim()
                if (trimmed.startsWith("Question:", ignoreCase = true)) {
                    qText = trimmed.substringAfter(":").trim()
                    currentSection = "question"
                } else if (trimmed.startsWith("A:", ignoreCase = true)) {
                    optA = trimmed.substringAfter(":").trim()
                    currentSection = "A"
                } else if (trimmed.startsWith("B:", ignoreCase = true)) {
                    optB = trimmed.substringAfter(":").trim()
                    currentSection = "B"
                } else if (trimmed.startsWith("C:", ignoreCase = true)) {
                    optC = trimmed.substringAfter(":").trim()
                    currentSection = "C"
                } else if (trimmed.startsWith("D:", ignoreCase = true)) {
                    optD = trimmed.substringAfter(":").trim()
                    currentSection = "D"
                } else if (trimmed.startsWith("Correct:", ignoreCase = true)) {
                    correct = trimmed.substringAfter(":").trim().uppercase().take(1)
                    currentSection = "correct"
                } else if (trimmed.startsWith("Explanation:", ignoreCase = true)) {
                    val exp = trimmed.substringAfter(":").trim()
                    if (exp.isNotBlank()) explanationLines.add(exp)
                    currentSection = "explanation"
                } else if (trimmed.isNotBlank()) {
                    if (currentSection == "question") {
                        qText += " $trimmed"
                    } else if (currentSection == "explanation") {
                        explanationLines.add(trimmed)
                    }
                }
            }

            val opts = mutableMapOf<String, String>()
            if (optA.isNotBlank()) opts["A"] = optA
            if (optB.isNotBlank()) opts["B"] = optB
            if (optC.isNotBlank()) opts["C"] = optC
            if (optD.isNotBlank()) opts["D"] = optD

            list.add(
                MCQQuestion(
                    number = qNum,
                    questionText = qText.ifBlank { "Question $qNum" },
                    options = opts,
                    correctAnswer = correct,
                    explanation = explanationLines.joinToString("\\n").trim()
                )
            )
        }
        return list.sortedBy { it.number }
    }

    fun loadQuestionsFromText(rawText: String): Boolean {
        val parsed = parseQuestions(rawText)
        if (parsed.isEmpty()) return false

        val map = parsed.associateBy { it.number }
        val firstQ = parsed.first().number
        val count = parsed.size

        _uiState.update { state ->
            state.copy(
                questions = map,
                startQuestion = firstQ,
                totalQuestions = count,
                currentQuestion = firstQ,
                answers = emptyMap(),
                isSubmitted = false,
                showImportDialog = false
            )
        }
        persistState()
        return true
    }

    fun submitTest() {
        _uiState.update { state ->
            state.copy(
                isSubmitted = true,
                showSubmitConfirmDialog = false
            )
        }
        persistState()
    }

    fun retakeTest() {
        _uiState.update { state ->
            state.copy(
                isSubmitted = false,
                answers = emptyMap(),
                currentQuestion = state.startQuestion
            )
        }
        persistState()
    }

    fun setUnansweredDialog(show: Boolean) = _uiState.update { it.copy(showUnansweredDialog = show) }
    fun setExportDialog(show: Boolean) = _uiState.update { it.copy(showExportDialog = show) }
    fun setClearAllDialog(show: Boolean) = _uiState.update { it.copy(showClearAllDialog = show) }
    fun setSetupDialog(show: Boolean) = _uiState.update { it.copy(showSetupDialog = show) }
    fun setImportDialog(show: Boolean) = _uiState.update { it.copy(showImportDialog = show) }
    fun setSubmitConfirmDialog(show: Boolean) = _uiState.update { it.copy(showSubmitConfirmDialog = show) }

    fun generateTxtExport(): String {
        val state = _uiState.value
        val sb = StringBuilder()
        for (q in state.startQuestion..state.endQuestion) {
            val ans = state.answers[q] ?: ""
            val valid = if (ans in listOf("A", "B", "C", "D")) ans else ""
            sb.append("$q-$valid\\n")
        }
        return sb.toString().trimEnd()
    }

    fun generateCsvExport(): String {
        val state = _uiState.value
        val sb = StringBuilder("Question,Answer\\n")
        for (q in state.startQuestion..state.endQuestion) {
            val ans = state.answers[q] ?: ""
            val valid = if (ans in listOf("A", "B", "C", "D")) ans else ""
            sb.append("$q,$valid\\n")
        }
        return sb.toString().trimEnd()
    }
}
`
  );

  const themePkg = javaPkg?.folder('ui')?.folder('theme');
  themePkg?.file(
    'Theme.kt',
    `package com.mcq.answerpad.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Slate950 = Color(0xFF090D16)
val Slate900 = Color(0xFF0F172A)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate400 = Color(0xFF94A3B8)
val Slate100 = Color(0xFFF1F5F9)

val EmeraldAccent = Color(0xFF10B981)
val BlueAccent = Color(0xFF3B82F6)
val BlueSelected = Color(0xFF2563EB)
val AmberSkip = Color(0xFFF59E0B)
val RoseClear = Color(0xFFEF4444)

private val DarkColorScheme = darkColorScheme(
    primary = BlueAccent,
    onPrimary = Color.White,
    secondary = EmeraldAccent,
    onSecondary = Color.White,
    tertiary = AmberSkip,
    background = Slate950,
    onBackground = Slate100,
    surface = Slate900,
    onSurface = Slate100,
    surfaceVariant = Slate800,
    onSurfaceVariant = Slate400
)

@Composable
fun MCQAnswerPadTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
`
  );

  // GitHub Action
  const github = zip.folder('.github')?.folder('workflows');
  github?.file(
    'build-apk.yml',
    `name: Build Android APK
on:
  push:
    branches: [ "main" ]
  workflow_dispatch:
jobs:
  build:
    name: Build Android Debug APK
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
      - name: Set up Java 17
        uses: actions/setup-java@v5
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Make gradlew executable
        run: chmod +x gradlew || true
      - name: Build Debug APK
        run: ./gradlew assembleDebug --stacktrace
      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: MCQ-Answer-Pad-debug-apk
          path: app/build/outputs/apk/debug/*.apk
`
  );

  // README with clear instructions
  zip.file(
    'README.md',
    `# MCQ Answer Pad - Native Android App (Jetpack Compose)

This is the complete native Android Jetpack Compose project for **MCQ Answer Pad**.

## How to Install APK on your Android Tablet (Without Android Studio):

### Option A: The Easiest Way (PWA - Instant 1-tap, no build needed)
1. Open the hosted web application URL on your Android Tablet in Google Chrome.
2. Tap the 3 dots menu in Chrome (or the "Install App" button inside the app).
3. Select **"Install App"** or **"Add to Home screen"**.
4. The app installs directly onto your tablet home screen. It runs 100% offline, full-screen, with no browser address bar, with large touch-friendly buttons designed for lying down!

### Option B: Build APK with Free GitHub Actions (No Android Studio required)
1. Create a new free repository on [GitHub](https://github.com).
2. Upload this folder's contents into the repository.
3. Click the **"Actions"** tab on your GitHub repository.
4. The "Build Android APK" workflow runs automatically in ~2 minutes.
5. Click on the completed run and download **MCQ-Answer-Pad.apk**.
6. Transfer or email the .apk to your tablet, tap it, and tap **"Install"**!
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'MCQ-Answer-Pad-Android-Project.zip');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
