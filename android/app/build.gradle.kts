val reactNativeRoot = rootProject.projectDir.parentFile.resolve("reactnative")

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.facebook.react")
}

android {
    namespace = "com.daviplata"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.daviplata"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        buildConfigField("String", "API_BASE_URL", "\"https://daviplata-app.vercel.app\"")
    }

    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        debug {
            isDebuggable = true
            signingConfig = signingConfigs.getByName("debug")
        }
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.facebook.react:react-android")

    if (properties["hermesEnabled"]?.toString()?.toBoolean() == true) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation("org.webkit:android-jsc:+")
    }
}

react {
    root = reactNativeRoot
    entryFile = reactNativeRoot.resolve("entry-points").resolve("login.js")
    debuggableVariants = listOf("debug")
}

// Skip RN auto-bundle in release (usamos bundles pre-compilados)
gradle.taskGraph.whenReady {
    allTasks.forEach { task ->
        if (task.name.contains("BundleReleaseJsAndAssets") || task.name.contains("CreateBundleReleaseJsAndAssets")) {
            task.enabled = false
        }
    }
}