package com.daviplata.session

import android.os.Bundle

data class SessionData(
    val sessionId: String,
    val userId: String,
    val name: String,
    val phone: String,
    val expiresAt: Long
) {
    fun toBundle(): Bundle = Bundle().apply {
        putString("sessionId", sessionId)
        putString("userId", userId)
        putString("name", name)
        putString("phone", phone)
        putLong("expiresAt", expiresAt)
    }
}
