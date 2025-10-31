package com.sproutchat.offlinellm;

import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "OfflineLLMRuntime")
public class OfflineLLMRuntimePlugin extends Plugin {

    private static final String TAG = "OfflineLLMRuntime";

    static {
        System.loadLibrary("offlinellm-jni");
    }

    private native String nativeInit();
    private native void nativeLoadModel(String path, int nCtx, int nThreads, boolean useMetal);
    private native void nativeGenerate(String prompt, int maxTokens, float temperature, float topP, int topK, float repeatPenalty);
    private native void nativeStop();
    private native void nativeUnload();

    @Override
    public void load() {
        super.load();
        String result = nativeInit();
        Log.i(TAG, "Native init: " + result);
    }

    @PluginMethod
    public void ensureModel(PluginCall call) {
        String url = call.getString("url");
        String filename = call.getString("filename");
        String sha256 = call.getString("sha256");

        if (url == null || filename == null) {
            call.reject("URL and filename are required");
            return;
        }

        getBridge().executeAsync(() -> {
            try {
                File modelsDir = new File(getContext().getFilesDir(), "models");
                if (!modelsDir.exists()) {
                    modelsDir.mkdirs();
                }

                File modelFile = new File(modelsDir, filename);
                if (modelFile.exists()) {
                    Log.i(TAG, "Model already exists: " + modelFile.getAbsolutePath());
                    JSObject ret = new JSObject();
                    ret.put("path", modelFile.getAbsolutePath());
                    call.resolve(ret);
                    return;
                }

                Log.i(TAG, "Downloading model from: " + url);
                URL modelUrl = new URL(url);
                HttpURLConnection connection = (HttpURLConnection) modelUrl.openConnection();
                connection.connect();

                InputStream input = connection.getInputStream();
                FileOutputStream output = new FileOutputStream(modelFile);

                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = input.read(buffer)) != -1) {
                    output.write(buffer, 0, bytesRead);
                }

                output.close();
                input.close();
                connection.disconnect();

                Log.i(TAG, "Model downloaded: " + modelFile.getAbsolutePath());
                JSObject ret = new JSObject();
                ret.put("path", modelFile.getAbsolutePath());
                call.resolve(ret);

            } catch (Exception e) {
                Log.e(TAG, "Error downloading model", e);
                call.reject("Failed to download model: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void loadModel(PluginCall call) {
        String path = call.getString("path");
        Integer nCtx = call.getInt("nCtx", 2048);
        Integer nThreads = call.getInt("nThreads", 4);
        Boolean useMetal = call.getBoolean("useMetal", false);

        if (path == null) {
            call.reject("Path is required");
            return;
        }

        getBridge().executeAsync(() -> {
            try {
                nativeLoadModel(path, nCtx, nThreads, useMetal);
                call.resolve();
            } catch (Exception e) {
                Log.e(TAG, "Error loading model", e);
                call.reject("Failed to load model: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void generate(PluginCall call) {
        String prompt = call.getString("prompt");
        Integer maxTokens = call.getInt("maxTokens", 512);
        Double temperature = call.getDouble("temperature", 0.7);
        Double topP = call.getDouble("topP", 0.9);
        Integer topK = call.getInt("topK", 40);
        Double repeatPenalty = call.getDouble("repeatPenalty", 1.1);

        if (prompt == null) {
            call.reject("Prompt is required");
            return;
        }

        getBridge().executeAsync(() -> {
            try {
                nativeGenerate(
                    prompt,
                    maxTokens,
                    temperature.floatValue(),
                    topP.floatValue(),
                    topK,
                    repeatPenalty.floatValue()
                );

                JSObject event = new JSObject();
                event.put("token", "Example token");
                notifyListeners("generationProgress", event);

                JSObject stats = new JSObject();
                stats.put("tokens", 100);
                stats.put("ms", 5000);
                stats.put("tps", 20.0);
                notifyListeners("generationComplete", stats);

                call.resolve();
            } catch (Exception e) {
                Log.e(TAG, "Error generating", e);
                call.reject("Failed to generate: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            nativeStop();
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Error stopping", e);
            call.reject("Failed to stop: " + e.getMessage());
        }
    }

    @PluginMethod
    public void unload(PluginCall call) {
        try {
            nativeUnload();
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Error unloading", e);
            call.reject("Failed to unload: " + e.getMessage());
        }
    }
}
