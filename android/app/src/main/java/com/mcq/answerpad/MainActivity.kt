package com.mcq.answerpad

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
