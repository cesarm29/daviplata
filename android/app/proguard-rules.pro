# React Native
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.**
-keep class com.facebook.hermes.** { *; }

# Bridge classes (reflection)
-keepclassmembers class com.daviplata.bridge.** { *; }
-keep class com.daviplata.DaviplataApplication { *; }
-keep class com.daviplata.MainActivity { *; }

# React Native modules
-keep class com.facebook.react.turbomodule.** { *; }

# JSON
-keep class org.json.** { *; }

# OkHttp
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep JNI methods
-keepclasseswithmembernames class * {
    native <methods>;
}