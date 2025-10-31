package com.sproutchat.offlinellm

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.*

@CapacitorPlugin(name = "OfflineLLMRuntime")
class OfflineLLMRuntimePlugin : Plugin() {
    private val TAG = "OfflineLLMRuntime"
    private var llamaBridge: LlamaBridge? = null
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    init {
        System.loadLibrary("llama_bridge")
    }

    override fun load() {
        super.load()
        llamaBridge = LlamaBridge()
        Log.i(TAG, "OfflineLLMRuntime plugin loaded")
    }

    @PluginMethod
    fun ensureModel(call: PluginCall) {
        val url = call.getString("url")
        val filename = call.getString("filename")
        val sha256 = call.getString("sha256")

        if (url == null || filename == null) {
            call.reject("URL and filename are required")
            return
        }

        scope.launch {
            try {
                val modelsDir = File(context.filesDir, "models")
                if (!modelsDir.exists()) {
                    modelsDir.mkdirs()
                }

                val modelFile = File(modelsDir, filename)
                if (modelFile.exists()) {
                    Log.i(TAG, "Model already exists: ${modelFile.absolutePath}")
                    withContext(Dispatchers.Main) {
                        call.resolve(JSObject().put("path", modelFile.absolutePath))
                    }
                    return@launch
                }

                Log.i(TAG, "Downloading model from: $url")
                val modelUrl = URL(url)
                val connection = modelUrl.openConnection() as HttpURLConnection
                connection.connect()

                val totalBytes = connection.contentLength.toLong()
                var downloadedBytes = 0L

                val input = connection.inputStream
                val output = FileOutputStream(modelFile)

                val buffer = ByteArray(8192)
                var bytesRead: Int

                while (input.read(buffer).also { bytesRead = it } != -1) {
                    output.write(buffer, 0, bytesRead)
                    downloadedBytes += bytesRead

                    val progress = (downloadedBytes.toFloat() / totalBytes * 100).toInt()
                    withContext(Dispatchers.Main) {
                        notifyListeners("modelDownload", JSObject()
                            .put("filename", filename)
                            .put("progress", progress)
                            .put("downloaded", downloadedBytes)
                            .put("total", totalBytes))
                    }
                }

                output.close()
                input.close()
                connection.disconnect()

                Log.i(TAG, "Model downloaded: ${modelFile.absolutePath}")
                withContext(Dispatchers.Main) {
                    call.resolve(JSObject().put("path", modelFile.absolutePath))
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error downloading model", e)
                withContext(Dispatchers.Main) {
                    call.reject("Failed to download model: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun listDownloadedModels(call: PluginCall) {
        try {
            val modelsDir = File(context.filesDir, "models")
            if (!modelsDir.exists()) {
                call.resolve(JSObject().put("models", emptyArray<String>()))
                return
            }

            val models = modelsDir.listFiles()
                ?.filter { it.isFile && it.name.endsWith(".gguf") }
                ?.map { file ->
                    JSObject()
                        .put("filename", file.name)
                        .put("path", file.absolutePath)
                        .put("size", file.length())
                }
                ?.toTypedArray() ?: emptyArray()

            call.resolve(JSObject().put("models", models))
        } catch (e: Exception) {
            Log.e(TAG, "Error listing models", e)
            call.reject("Failed to list models: ${e.message}")
        }
    }

    @PluginMethod
    fun deleteModel(call: PluginCall) {
        val filename = call.getString("filename")
        if (filename == null) {
            call.reject("Filename is required")
            return
        }

        try {
            val modelsDir = File(context.filesDir, "models")
            val modelFile = File(modelsDir, filename)

            if (!modelFile.exists()) {
                call.reject("Model not found")
                return
            }

            if (modelFile.delete()) {
                Log.i(TAG, "Model deleted: $filename")
                call.resolve()
            } else {
                call.reject("Failed to delete model")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting model", e)
            call.reject("Failed to delete model: ${e.message}")
        }
    }

    @PluginMethod
    fun loadModel(call: PluginCall) {
        val path = call.getString("path")
        val nCtx = call.getInt("nCtx", 2048)
        val nThreads = call.getInt("nThreads", 4)
        val useMetal = call.getBoolean("useMetal", false)

        if (path == null) {
            call.reject("Path is required")
            return
        }

        scope.launch {
            try {
                val result = llamaBridge?.loadModel(path, nCtx!!, nThreads!!)
                if (result == true) {
                    Log.i(TAG, "Model loaded: $path")
                    withContext(Dispatchers.Main) {
                        call.resolve()
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        call.reject("Failed to load model")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error loading model", e)
                withContext(Dispatchers.Main) {
                    call.reject("Failed to load model: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun unloadModel(call: PluginCall) {
        try {
            llamaBridge?.unloadModel()
            Log.i(TAG, "Model unloaded")
            call.resolve()
        } catch (e: Exception) {
            Log.e(TAG, "Error unloading model", e)
            call.reject("Failed to unload model: ${e.message}")
        }
    }

    @PluginMethod
    fun clearContext(call: PluginCall) {
        try {
            llamaBridge?.clearContext()
            Log.i(TAG, "Context cleared")
            call.resolve()
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing context", e)
            call.reject("Failed to clear context: ${e.message}")
        }
    }

    @PluginMethod
    fun generate(call: PluginCall) {
        val prompt = call.getString("prompt")
        val maxTokens = call.getInt("maxTokens", 512)
        val temperature = call.getDouble("temperature", 0.7)
        val topP = call.getDouble("topP", 0.9)
        val topK = call.getInt("topK", 40)
        val repeatPenalty = call.getDouble("repeatPenalty", 1.1)

        if (prompt == null) {
            call.reject("Prompt is required")
            return
        }

        scope.launch {
            try {
                val startTime = System.currentTimeMillis()
                var tokenCount = 0

                llamaBridge?.generate(
                    prompt,
                    maxTokens!!,
                    temperature!!.toFloat(),
                    topP!!.toFloat(),
                    topK!!,
                    repeatPenalty!!.toFloat()
                ) { token ->
                    tokenCount++
                    withContext(Dispatchers.Main) {
                        notifyListeners("generationProgress", JSObject().put("token", token))
                    }
                }

                val elapsedMs = System.currentTimeMillis() - startTime
                val tps = if (elapsedMs > 0) tokenCount.toDouble() / (elapsedMs / 1000.0) else 0.0

                withContext(Dispatchers.Main) {
                    notifyListeners("generationComplete", JSObject()
                        .put("tokens", tokenCount)
                        .put("ms", elapsedMs)
                        .put("tps", tps))
                    call.resolve()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error generating", e)
                withContext(Dispatchers.Main) {
                    call.reject("Failed to generate: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun stopInference(call: PluginCall) {
        try {
            llamaBridge?.stopInference()
            Log.i(TAG, "Inference stopped")
            call.resolve()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping inference", e)
            call.reject("Failed to stop inference: ${e.message}")
        }
    }

    @PluginMethod
    fun getModelInfo(call: PluginCall) {
        try {
            val info = llamaBridge?.getModelInfo()
            if (info != null) {
                call.resolve(JSObject()
                    .put("loaded", info.loaded)
                    .put("modelPath", info.modelPath)
                    .put("nCtx", info.nCtx)
                    .put("nThreads", info.nThreads))
            } else {
                call.resolve(JSObject().put("loaded", false))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting model info", e)
            call.reject("Failed to get model info: ${e.message}")
        }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        scope.cancel()
        llamaBridge?.unloadModel()
    }
}
