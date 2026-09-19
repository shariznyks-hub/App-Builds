package com.mcq.answerpad.ui.theme

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
