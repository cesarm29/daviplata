package com.daviplata.network

import android.os.Bundle
import com.daviplata.BuildConfig
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class ApiClient {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val baseUrl = BuildConfig.API_BASE_URL

    private fun makeRequest(
        method: String,
        endpoint: String,
        token: String? = null,
        body: String? = null
    ): JSONObject {
        val url = "$baseUrl$endpoint"
        val mediaType = "application/json".toMediaType()

        val requestBuilder = Request.Builder()
            .url(url)
            .addHeader("Content-Type", "application/json")

        if (token != null) {
            requestBuilder.addHeader("Authorization", "Bearer $token")
        }

        when (method) {
            "POST" -> {
                val requestBody = (body ?: "{}").toRequestBody(mediaType)
                requestBuilder.post(requestBody)
            }
            "GET" -> requestBuilder.get()
        }

        val response = client.newCall(requestBuilder.build()).execute()
        val responseBody = response.body?.string() ?: "{}"

        if (!response.isSuccessful) {
            val errorJson = try { JSONObject(responseBody) } catch (e: Exception) { JSONObject() }
            throw Exception(errorJson.optString("message", "Error HTTP ${response.code}"))
        }

        return JSONObject(responseBody)
    }

    fun login(email: String, password: String): Bundle {
        val body = JSONObject().apply {
            put("email", email)
            put("password", password)
        }
        val result = makeRequest("POST", "/api/auth/login", body = body.toString())

        val user = result.optJSONObject("user")
        return Bundle().apply {
            putString("sessionId", result.optString("sessionId"))
            putString("token", result.optString("token"))
            putString("userId", user?.optString("id") ?: "")
            putString("name", user?.optString("fullName") ?: "")
            putString("email", user?.optString("email") ?: "")
            putString("phone", user?.optString("phone") ?: "")
        }
    }

    fun getBalance(token: String): Bundle {
        val result = makeRequest("GET", "/api/accounts/balance", token)
        return Bundle().apply {
            putDouble("balance", result.optDouble("balance", 0.0))
            putString("accountNumber", result.optString("accountNumber"))
            putString("currency", result.optString("currency"))
        }
    }

    fun transfer(token: String, destinationPhone: String, amount: Double, description: String?): Bundle {
        val body = JSONObject().apply {
            put("destinationPhone", destinationPhone)
            put("amount", amount)
            if (description != null) put("description", description)
        }
        val result = makeRequest("POST", "/api/transactions/transfer", token, body.toString())
        return Bundle().apply {
            putString("transactionId", result.optJSONObject("transaction")?.optString("id") ?: "")
        }
    }

    fun getMovements(token: String, page: Int): Bundle {
        val result = makeRequest("GET", "/api/transactions/movements?page=$page&limit=20", token)
        return Bundle().apply {
            putInt("total", result.optInt("total", 0))
            putInt("page", result.optInt("page", 1))
        }
    }
}
