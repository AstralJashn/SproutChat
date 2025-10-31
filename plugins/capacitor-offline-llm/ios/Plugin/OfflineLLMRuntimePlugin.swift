import Foundation
import Capacitor

@objc(OfflineLLMRuntimePlugin)
public class OfflineLLMRuntimePlugin: CAPPlugin {

    override public func load() {
        super.load()
        NSLog("OfflineLLMRuntime: Plugin loaded")
    }

    @objc func ensureModel(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let filename = call.getString("filename"),
              let url = URL(string: urlString) else {
            call.reject("URL and filename are required")
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let modelsDir = documentsPath.appendingPathComponent("models")

                if !FileManager.default.fileExists(atPath: modelsDir.path) {
                    try FileManager.default.createDirectory(at: modelsDir, withIntermediateDirectories: true)
                }

                let modelFile = modelsDir.appendingPathComponent(filename)

                if FileManager.default.fileExists(atPath: modelFile.path) {
                    NSLog("OfflineLLMRuntime: Model already exists: \(modelFile.path)")
                    call.resolve(["path": modelFile.path])
                    return
                }

                NSLog("OfflineLLMRuntime: Downloading model from: \(urlString)")
                let data = try Data(contentsOf: url)
                try data.write(to: modelFile)

                NSLog("OfflineLLMRuntime: Model downloaded: \(modelFile.path)")
                call.resolve(["path": modelFile.path])

            } catch {
                NSLog("OfflineLLMRuntime: Error downloading model: \(error)")
                call.reject("Failed to download model: \(error.localizedDescription)")
            }
        }
    }

    @objc func loadModel(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            call.reject("Path is required")
            return
        }

        let nCtx = call.getInt("nCtx") ?? 2048
        let nThreads = call.getInt("nThreads") ?? 4
        let useMetal = call.getBool("useMetal") ?? true

        DispatchQueue.global(qos: .userInitiated).async {
            NSLog("OfflineLLMRuntime: Loading model: \(path), ctx=\(nCtx), threads=\(nThreads), metal=\(useMetal)")
            call.resolve()
        }
    }

    @objc func generate(_ call: CAPPluginCall) {
        guard let prompt = call.getString("prompt") else {
            call.reject("Prompt is required")
            return
        }

        let maxTokens = call.getInt("maxTokens") ?? 512
        let temperature = call.getDouble("temperature") ?? 0.7
        let topP = call.getDouble("topP") ?? 0.9
        let topK = call.getInt("topK") ?? 40
        let repeatPenalty = call.getDouble("repeatPenalty") ?? 1.1

        DispatchQueue.global(qos: .userInitiated).async {
            NSLog("OfflineLLMRuntime: Generate: \(prompt), maxTokens=\(maxTokens), temp=\(temperature)")

            self.notifyListeners("generationProgress", data: ["token": "Example token"])

            self.notifyListeners("generationComplete", data: [
                "tokens": 100,
                "ms": 5000,
                "tps": 20.0
            ])

            call.resolve()
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        NSLog("OfflineLLMRuntime: Stop generation")
        call.resolve()
    }

    @objc func unload(_ call: CAPPluginCall) {
        NSLog("OfflineLLMRuntime: Unload model")
        call.resolve()
    }
}
