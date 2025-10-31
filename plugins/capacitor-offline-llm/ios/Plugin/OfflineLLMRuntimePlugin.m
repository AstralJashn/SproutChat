#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(OfflineLLMRuntimePlugin, "OfflineLLMRuntime",
    CAP_PLUGIN_METHOD(ensureModel, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(listDownloadedModels, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(deleteModel, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(loadModel, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(unloadModel, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(clearContext, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(generate, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopInference, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getModelInfo, CAPPluginReturnPromise);
)
