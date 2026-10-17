package com.mcq.answerpad

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

    // Evaluation stats (Calculated post-submission)
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
        val regex = Regex("\\[Q(\\d+)\\]([\\s\\S]*?)\\[/Q\\1\\]", RegexOption.IGNORE_CASE)
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
                    explanation = explanationLines.joinToString("\n").trim()
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
