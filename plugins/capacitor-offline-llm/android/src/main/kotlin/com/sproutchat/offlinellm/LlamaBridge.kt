package com.sproutchat.offlinellm

data class ModelInfo(
    val loaded: Boolean,
    val modelPath: String?,
    val nCtx: Int,
    val nThreads: Int
)

class LlamaBridge {
    private external fun nativeInit(): String
    private external fun nativeLoadModel(path: String, nCtx: Int, nThreads: Int): Boolean
    private external fun nativeUnloadModel()
    private external fun nativeClearContext()
    private external fun nativeGenerate(
        prompt: String,
        maxTokens: Int,
        temperature: Float,
        topP: Float,
        topK: Int,
        repeatPenalty: Float,
        callback: (String) -> Unit
    )
    private external fun nativeStopInference()
    private external fun nativeIsLoaded(): Boolean
    private external fun nativeGetModelPath(): String?
    private external fun nativeGetContextSize(): Int
    private external fun nativeGetThreads(): Int

    init {
        nativeInit()
    }

    fun loadModel(path: String, nCtx: Int, nThreads: Int): Boolean {
        return nativeLoadModel(path, nCtx, nThreads)
    }

    fun unloadModel() {
        nativeUnloadModel()
    }

    fun clearContext() {
        nativeClearContext()
    }

    fun generate(
        prompt: String,
        maxTokens: Int,
        temperature: Float,
        topP: Float,
        topK: Int,
        repeatPenalty: Float,
        onToken: (String) -> Unit
    ) {
        nativeGenerate(prompt, maxTokens, temperature, topP, topK, repeatPenalty, onToken)
    }

    fun stopInference() {
        nativeStopInference()
    }

    fun getModelInfo(): ModelInfo {
        return ModelInfo(
            loaded = nativeIsLoaded(),
            modelPath = nativeGetModelPath(),
            nCtx = nativeGetContextSize(),
            nThreads = nativeGetThreads()
        )
    }
}
