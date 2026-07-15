package com.daviplata.splash

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.daviplata.R
import com.daviplata.navigation.NavigationManager
import com.daviplata.session.SessionManager

class SplashActivity : AppCompatActivity() {

    private var navManager: NavigationManager? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        Handler(Looper.getMainLooper()).postDelayed({
            navManager = NavigationManager(this)
            val sessionManager = SessionManager(this)
            val session = sessionManager.getSession()

            if (session != null && !sessionManager.isExpired(session)) {
                navManager!!.loadBundle("home", session.toBundle())
            } else {
                navManager!!.loadBundle("login", null)
            }
        }, 2000)
    }

    override fun onResume() {
        super.onResume()
        navManager?.onHostResume(this)
    }

    override fun onPause() {
        super.onPause()
        navManager?.onHostPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        navManager?.destroy()
    }
}