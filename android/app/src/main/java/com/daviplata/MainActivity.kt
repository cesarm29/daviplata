package com.daviplata

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.daviplata.splash.SplashActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startActivity(android.content.Intent(this, SplashActivity::class.java))
        finish()
    }
}
