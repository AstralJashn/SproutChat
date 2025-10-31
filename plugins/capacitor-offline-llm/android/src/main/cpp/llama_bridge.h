#ifndef LLAMA_BRIDGE_H
#define LLAMA_BRIDGE_H

#include <jni.h>
#include <string>
#include <atomic>

struct llama_model;
struct llama_context;

class LlamaBridge {
public:
    static LlamaBridge& getInstance();

    bool loadModel(const std::string& path, int nCtx, int nThreads);
    void unloadModel();
    void clearContext();
    void generate(
        const std::string& prompt,
        int maxTokens,
        float temperature,
        float topP,
        int topK,
        float repeatPenalty,
        JNIEnv* env,
        jobject callback
    );
    void stopInference();

    bool isLoaded() const { return model != nullptr; }
    std::string getModelPath() const { return modelPath; }
    int getContextSize() const { return contextSize; }
    int getThreads() const { return numThreads; }

private:
    LlamaBridge() = default;
    ~LlamaBridge();

    LlamaBridge(const LlamaBridge&) = delete;
    LlamaBridge& operator=(const LlamaBridge&) = delete;

    llama_model* model = nullptr;
    llama_context* context = nullptr;

    std::string modelPath;
    int contextSize = 0;
    int numThreads = 0;
    std::atomic<bool> shouldStop{false};
};

#endif
