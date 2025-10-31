import Foundation
import Capacitor

@objc(OfflineLLMRuntimePlugin)
public class OfflineLLMRuntimePlugin: CAPPlugin {
    private let bridge = LlamaBridge.sharedInstance()

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

    @objc func listDownloadedModels(_ call: CAPPluginCall) {
        do {
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let modelsDir = documentsPath.appendingPathComponent("models")

            if !FileManager.default.fileExists(atPath: modelsDir.path) {
                call.resolve(["models": []])
                return
            }

            let files = try FileManager.default.contentsOfDirectory(at: modelsDir, includingPropertiesForKeys: [.fileSizeKey])
            let models = files.filter { $0.pathExtension == "gguf" }.compactMap { file -> [String: Any]? in
                guard let attributes = try? FileManager.default.attributesOfItem(atPath: file.path),
                      let fileSize = attributes[.size] as? Int64 else { return nil }
                return ["filename": file.lastPathComponent, "path": file.path, "size": fileSize]
            }
            call.resolve(["models": models])
        } catch {
            call.reject("Failed to list models: \(error.localizedDescription)")
        }
    }

    @objc func deleteModel(_ call: CAPPluginCall) {
        guard let filename = call.getString("filename") else {
            call.reject("Filename is required")
            return
        }
        do {
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let modelFile = documentsPath.appendingPathComponent("models").appendingPathComponent(filename)
            if !FileManager.default.fileExists(atPath: modelFile.path) {
                call.reject("Model not found")
                return
            }
            try FileManager.default.removeItem(at: modelFile)
            NSLog("OfflineLLMRuntime: Model deleted: \(filename)")
            call.resolve()
        } catch {
            call.reject("Failed to delete model: \(error.localizedDescription)")
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
            let result = self.bridge.loadModel(withPath: path, nCtx: nCtx, nThreads: nThreads, useMetal: useMetal)
            if result {
                call.resolve()
            } else {
                call.reject("Failed to load model")
            }
        }
    }

    @objc func unloadModel(_ call: CAPPluginCall) {
        bridge.unloadModel()
        NSLog("OfflineLLMRuntime: Model unloaded")
        call.resolve()
    }

    @objc func clearContext(_ call: CAPPluginCall) {
        bridge.clearContext()
        NSLog("OfflineLLMRuntime: Context cleared")
        call.resolve()
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
        let startTime = Date()
        var tokenCount = 0
        bridge.generate(
            withPrompt: prompt,
            maxTokens: maxTokens,
            temperature: Float(temperature),
            topP: Float(topP),
            topK: topK,
            repeatPenalty: Float(repeatPenalty)
        ) { token in
            tokenCount += 1
            self.notifyListeners("generationProgress", data: ["token": token])
        }
        DispatchQueue.global(qos: .userInitiated).asyncAfter(deadline: .now() + 0.1) {
            let elapsedMs = Int(Date().timeIntervalSince(startTime) * 1000)
            let tps = elapsedMs > 0 ? Double(tokenCount) / (Double(elapsedMs) / 1000.0) : 0.0
            self.notifyListeners("generationComplete", data: ["tokens": tokenCount, "ms": elapsedMs, "tps": tps])
            call.resolve()
        }
    }

    @objc func stopInference(_ call: CAPPluginCall) {
        bridge.stopInference()
        NSLog("OfflineLLMRuntime: Inference stopped")
        call.resolve()
    }

    @objc func getModelInfo(_ call: CAPPluginCall) {
        let info = bridge.getModelInfo()
        call.resolve(["loaded": info.loaded, "modelPath": info.modelPath ?? "", "nCtx": info.nCtx, "nThreads": info.nThreads])
    }
}
