package com.mcq.answerpad

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
        // Does NOT save skip as answer; leaves blank
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
            sb.append("$q-$valid\n")
        }
        return sb.toString().trimEnd()
    }

    fun generateCsvExport(): String {
        val state = _uiState.value
        val sb = StringBuilder("Question,Answer\n")
        for (q in state.startQuestion..state.endQuestion) {
            val ans = state.answers[q] ?: ""
            val valid = if (ans in listOf("A", "B", "C", "D")) ans else ""
            sb.append("$q,$valid\n")
        }
        return sb.toString().trimEnd()
    }
}
