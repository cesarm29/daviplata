pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://www.jitpack.io") }
    }
}

rootProject.name = "Daviplata"
include(":app")

includeBuild("../reactnative/node_modules/@react-native/gradle-plugin")
