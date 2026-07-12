package com.daviplata.session

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import org.json.JSONObject

class SessionManager(context: Context) {

    private val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        "daviplata_session",
        masterKeyAlias,
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveSession(data: SessionData) {
        val json = JSONObject().apply {
            put("sessionId", data.sessionId)
            put("userId", data.userId)
            put("name", data.name)
            put("phone", data.phone)
            put("expiresAt", data.expiresAt)
        }
        sharedPreferences.edit().putString("session", json.toString()).apply()
    }

    fun getSession(): SessionData? {
        val jsonStr = sharedPreferences.getString("session", null) ?: return null
        return try {
            val json = JSONObject(jsonStr)
            SessionData(
                sessionId = json.getString("sessionId"),
                userId = json.getString("userId"),
                name = json.getString("name"),
                phone = json.getString("phone"),
                expiresAt = json.getLong("expiresAt")
            )
        } catch (e: Exception) {
            null
        }
    }

    fun clearSession() {
        sharedPreferences.edit().remove("session").apply()
    }

    fun isExpired(session: SessionData): Boolean {
        return session.expiresAt < System.currentTimeMillis()
    }
}
