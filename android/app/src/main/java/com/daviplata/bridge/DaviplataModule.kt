package com.daviplata.bridge

import android.os.Bundle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

import com.daviplata.network.ApiClient
import com.daviplata.session.SessionManager
import com.daviplata.security.RootDetector
import com.daviplata.security.CryptoManager

class DaviplataModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DaviplataModule"

    private val apiClient = ApiClient()

    @ReactMethod
    fun getSession(promise: Promise) {
        try {
            val sessionManager = SessionManager(reactApplicationContext)
            val session = sessionManager.getSession()
            if (session != null && !sessionManager.isExpired(session)) {
                val map = Bundle().apply {
                    putString("sessionId", session.sessionId)
                    putString("userId", session.userId)
                    putString("name", session.name)
                    putString("phone", session.phone)
                    putLong("expiresAt", session.expiresAt)
                }
                promise.resolve(map)
            } else {
                promise.reject("NO_SESSION", "No hay sesion activa")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun checkSecurity(promise: Promise) {
        try {
            val isRooted = RootDetector.isDeviceRooted()
            val map = Bundle().apply {
                putBoolean("isRooted", isRooted)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun sendEvent(eventName: String, data: ReadableMap?) {
        val activity = currentActivity ?: return
        val bundle = if (data != null) Arguments.toBundle(data) else null
        activity.runOnUiThread {
            val navManager = com.daviplata.navigation.NavigationManager(activity)
            navManager.handleEvent(eventName, bundle)
        }
    }

    @ReactMethod
    fun getBalance(token: String, promise: Promise) {
        Thread {
            try {
                val result = apiClient.getBalance(token)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("API_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun performTransfer(data: ReadableMap, promise: Promise) {
        Thread {
            try {
                val token = data.getString("token") ?: throw IllegalArgumentException("Token requerido")
                val destinationPhone = data.getString("destinationPhone") ?: throw IllegalArgumentException("Telefono requerido")
                val amount = data.getDouble("amount")
                val description = if (data.hasKey("description")) data.getString("description") else null

                if (amount <= 0) {
                    throw IllegalArgumentException("El monto debe ser mayor a 0")
                }

                val result = apiClient.transfer(token, destinationPhone, amount, description)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("API_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun getMovements(token: String, page: Int, promise: Promise) {
        Thread {
            try {
                val result = apiClient.getMovements(token, page)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("API_ERROR", e.message)
            }
        }.start()
    }

    @ReactMethod
    fun encryptData(plaintext: String, promise: Promise) {
        try {
            val encrypted = CryptoManager.encrypt(plaintext)
            promise.resolve(encrypted)
        } catch (e: Exception) {
            promise.reject("ENCRYPT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun decryptData(ciphertext: String, promise: Promise) {
        try {
            val decrypted = CryptoManager.decrypt(ciphertext)
            promise.resolve(decrypted)
        } catch (e: Exception) {
            promise.reject("DECRYPT_ERROR", e.message)
        }
    }
}