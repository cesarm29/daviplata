package com.daviplata.splash

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.daviplata.R
import com.daviplata.navigation.NavigationManager
import com.daviplata.session.SessionManager

class SplashActivity : AppCompatActivity() {

    private val MIN_SPLASH_TIME = 2000L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val startTime = System.currentTimeMillis()

        val sessionManager = SessionManager(this)
        val session = sessionManager.getSession()

        Handler(Looper.getMainLooper()).postDelayed({
            val navManager = NavigationManager(this)

            if (session != null && !sessionManager.isExpired(session)) {
                navManager.loadBundle("home", session.toBundle())
            } else {
                navManager.loadBundle("login", null)
            }
            finish()
        }, MIN_SPLASH_TIME)
    }
}
