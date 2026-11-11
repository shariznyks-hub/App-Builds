import JSZip from 'jszip';
import { downloadFile } from './exportUtils';

import androidManifestRaw from '../../android/app/src/main/AndroidManifest.xml?raw';
import mainActivityRaw from '../../android/app/src/main/java/com/mcq/answerpad/MainActivity.kt?raw';
import mcqViewModelRaw from '../../android/app/src/main/java/com/mcq/answerpad/MCQViewModel.kt?raw';
import mcqScreenRaw from '../../android/app/src/main/java/com/mcq/answerpad/ui/MCQScreen.kt?raw';
import themeRaw from '../../android/app/src/main/java/com/mcq/answerpad/ui/theme/Theme.kt?raw';
import buildApkRaw from '../../.github/workflows/build-apk.yml?raw';

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
    id("com.android.application") version "8.7.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
`
  );

  // Gradle wrapper
  const wrapper = zip.folder('gradle')?.folder('wrapper');
  wrapper?.file(
    'gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
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
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isDebuggable = true
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
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
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
  main?.file('AndroidManifest.xml', androidManifestRaw);

  // Kotlin source
  const javaPkg = main?.folder('java')?.folder('com')?.folder('mcq')?.folder('answerpad');
  javaPkg?.file('MainActivity.kt', mainActivityRaw);
  javaPkg?.file('MCQViewModel.kt', mcqViewModelRaw);

  const uiPkg = javaPkg?.folder('ui');
  uiPkg?.file('MCQScreen.kt', mcqScreenRaw);

  const themePkg = uiPkg?.folder('theme');
  themePkg?.file('Theme.kt', themeRaw);

  // GitHub Action
  const github = zip.folder('.github')?.folder('workflows');
  github?.file('build-apk.yml', buildApkRaw);

  zip.file(
    'README.md',
    `# MCQ Answer Pad - Android Native Project

This is the Android Studio native Jetpack Compose project for **MCQ Answer Pad**.

## Features Included
- **Adaptive Time Bank Timer**: Cumulative carry-forward countdown timer with soft overtime (+MM:SS) and pause/resume.
- **Custom Session Target**: Real-time counter and completion dialog with options to Continue, Pause & Save, or Submit.
- **Gamification & Learning Analytics**: XP progression, streaks, personal bests, and comprehensive scrollable analytics dashboard.
- **Vibration & Audio Feedback**: Tactile haptic vibration on taps with sound synthesizer and independent user switches in Settings.
- **5-Column CSV & TXT Export**: Detailed evaluation sheet with \`Question,Selected Answer,Correct Answer,Result,Explanation\`, and Mistakes-Only TXT deck.
- **Full Mobile Responsiveness**: Fluid scaling on all modern Android smartphone viewports.

## How to Build in GitHub Actions
1. Push this project to GitHub (branch \`main\` or \`master\`).
2. GitHub Actions will run \`.github/workflows/build-apk.yml\` with Java 17 and Gradle 8.9.
3. Download the finished **MCQ-Answer-Pad-debug-apk** artifact from the GitHub Actions run summary.

## How to Build Locally in Android Studio
1. Open Android Studio (Ladybug / Iguana or later).
2. Select **Open** and choose this folder.
3. Allow Gradle 8.9 sync to complete.
4. Click **Run** or **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  downloadFile(content as unknown as string, 'MCQ-Answer-Pad-Android-Project.zip', 'application/zip');
  URL.revokeObjectURL(url);
}
