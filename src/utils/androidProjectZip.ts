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
import org.json.JSONObject

data class MCQUiState(
    val startQuestion: Int = 1,
    val totalQuestions: Int = 500,
    val currentQuestion: Int = 1,
    val answers: Map<Int, String> = emptyMap(),
    val optionsCount: Int = 4,
    val showUnansweredDialog: Boolean = false,
    val showExportDialog: Boolean = false,
    val showClearAllDialog: Boolean = false,
    val showSetupDialog: Boolean = false
) {
    val endQuestion: Int get() = startQuestion + totalQuestions - 1
    val answeredCount: Int get() = answers.count { it.key in startQuestion..endQuestion && it.value.isNotBlank() }
    val unansweredCount: Int get() = totalQuestions - answeredCount
    val currentAnswer: String? get() = answers[currentQuestion]
    
    val unansweredList: List<Int> get() {
        val list = mutableListOf<Int>()
        for (q in startQuestion..endQuestion) {
            if (answers[q].isNullOrBlank()) {
                list.add(q)
            }
        }
        return list
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

        return MCQUiState(
            startQuestion = start,
            totalQuestions = total,
            currentQuestion = current.coerceIn(start, start + total - 1),
            answers = answersMap,
            optionsCount = optionsCount
        )
    }

    private fun persistState() {
        val state = _uiState.value
        val json = JSONObject()
        state.answers.forEach { (q, ans) ->
            json.put(q.toString(), ans)
        }
        prefs.edit()
            .putInt("start_question", state.startQuestion)
            .putInt("total_questions", state.totalQuestions)
            .putInt("current_question", state.currentQuestion)
            .putInt("options_count", state.optionsCount)
            .putString("answers_json", json.toString())
            .apply()
    }

    fun answerCurrent(option: String) {
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
                showClearAllDialog = false
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

    fun setUnansweredDialog(show: Boolean) = _uiState.update { it.copy(showUnansweredDialog = show) }
    fun setExportDialog(show: Boolean) = _uiState.update { it.copy(showExportDialog = show) }
    fun setClearAllDialog(show: Boolean) = _uiState.update { it.copy(showClearAllDialog = show) }
    fun setSetupDialog(show: Boolean) = _uiState.update { it.copy(showSetupDialog = show) }

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

  // GitHub Action
  const github = zip.folder('.github')?.folder('workflows');
  github?.file(
    'build-apk.yml',
    `name: Build Android APK
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - uses: gradle/actions/setup-gradle@v4
      - run: chmod +x gradlew || true
      - run: ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: MCQ-Answer-Pad.apk
          path: app/build/outputs/apk/debug/app-debug.apk
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
