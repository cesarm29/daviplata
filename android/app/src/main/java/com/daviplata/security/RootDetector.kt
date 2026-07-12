package com.daviplata.security

import android.os.Build
import java.io.File

object RootDetector {

    fun isDeviceRooted(): Boolean {
        return checkRootBinaries() || checkSuExists() || checkBuildTags() || checkEmulator()
    }

    private fun checkRootBinaries(): Boolean {
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/system/xbin/su",
            "/system/bin/su",
            "/sbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su"
        )
        return paths.any { File(it).exists() }
    }

    private fun checkSuExists(): Boolean {
        return try {
            val process = Runtime.getRuntime().exec(arrayOf("which", "su"))
            val reader = process.inputStream.bufferedReader()
            val result = reader.readLine()
            reader.close()
            process.destroy()
            result != null
        } catch (e: Exception) {
            false
        }
    }

    private fun checkBuildTags(): Boolean {
        val buildTags = Build.TAGS
        return buildTags != null && buildTags.contains("test-keys")
    }

    private fun checkEmulator(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
    }

    fun isDebuggable(): Boolean {
        return (ApplicationInfoCompat.FLAG_DEBUGGABLE and 0x2) != 0
    }
}

private object ApplicationInfoCompat {
    const val FLAG_DEBUGGABLE = 0x2
}
