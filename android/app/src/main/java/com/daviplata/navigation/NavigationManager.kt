package com.daviplata.navigation

import android.app.Application
import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.daviplata.BuildConfig
import com.daviplata.bridge.DaviplataPackage
import com.daviplata.session.SessionManager
import com.daviplata.session.SessionData
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactRootView
import com.facebook.react.common.LifecycleState
import com.facebook.react.shell.MainReactPackage

class NavigationManager(private val context: Context) {

    private val reactInstanceManagers = mutableMapOf<String, ReactInstanceManager>()
    private val rootViews = mutableMapOf<String, ReactRootView>()
    private var devRootView: ReactRootView? = null
    private var devInstanceManager: ReactInstanceManager? = null

    fun loadBundle(name: String, initialProps: Bundle?) {
        if (BuildConfig.DEBUG) {
            loadDevBundle(initialProps)
        } else {
            loadReleaseBundle(name, initialProps)
        }
    }

    private fun loadDevBundle(initialProps: Bundle?) {
        val activity = context as? AppCompatActivity ?: return
        if (devRootView == null) {
            devRootView = ReactRootView(context)
            val instanceManager = getDevInstanceManager()
            devRootView!!.startReactApplication(instanceManager, "DaviplataApp", initialProps ?: Bundle())
            val container = FrameLayout(context).apply {
                id = View.generateViewId()
            }
            container.addView(devRootView!!, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
            activity.setContentView(container)
        }
    }

    private fun getDevInstanceManager(): ReactInstanceManager {
        if (devInstanceManager == null) {
            val activity = context as? AppCompatActivity
            val builder = ReactInstanceManager.builder()
                .setApplication(context.applicationContext as Application)
                .setBundleAssetName("index.android.bundle")
                .setJSMainModulePath("index")
                .addPackage(DaviplataPackage())
                .addPackage(MainReactPackage())
                .setUseDeveloperSupport(true)
                .setInitialLifecycleState(LifecycleState.BEFORE_CREATE)
            if (activity != null) {
                builder.setCurrentActivity(activity)
            }
            devInstanceManager = builder.build()
        }
        return devInstanceManager!!
    }

    private fun loadReleaseBundle(name: String, initialProps: Bundle?) {
        val activity = context as? AppCompatActivity ?: return

        val rootView = ReactRootView(context)
        val reactInstanceManager = getOrCreateInstanceManager(name)
        val appComponent = "${name.replaceFirstChar { it.uppercase() }}Bundle"

        val props = Bundle()
        if (initialProps != null) {
            props.putAll(initialProps)
        }

        rootView.startReactApplication(reactInstanceManager, appComponent, props)

        val container = FrameLayout(context).apply {
            id = View.generateViewId()
        }
        container.addView(rootView, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ))

        activity.setContentView(container)

        reactInstanceManagers[name] = reactInstanceManager
        rootViews[name] = rootView
    }

    private fun getOrCreateInstanceManager(name: String): ReactInstanceManager {
        return reactInstanceManagers.getOrPut(name) {
            ReactInstanceManager.builder()
                .setApplication(context.applicationContext as Application)
                .setJSBundleFile("assets://bundles/$name/index.android.bundle")
                .setJSMainModulePath(null)
                .addPackage(DaviplataPackage())
                .addPackage(MainReactPackage())
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build()
        }
    }

    private fun getSessionBundle(): Bundle? {
        val sessionManager = SessionManager(context)
        val session = sessionManager.getSession() ?: return null
        return Bundle().apply {
            putString("userId", session.userId)
            putString("name", session.name)
            putString("phone", session.phone)
            putLong("expiresAt", session.expiresAt)
        }
    }

    fun handleEvent(event: String, data: Bundle?) {
        val token = data?.getString("token") ?: ""
        when (event) {
            "LOGIN_SUCCESS" -> {
                val sessionData = SessionData(
                    sessionId = data?.getString("sessionId") ?: "",
                    userId = data?.getString("userId") ?: "",
                    name = data?.getString("name") ?: "",
                    phone = data?.getString("phone") ?: "",
                    expiresAt = System.currentTimeMillis() + 86400000
                )
                SessionManager(context).saveSession(sessionData)
                val homeBundle = Bundle().apply {
                    putString("userId", sessionData.userId)
                    putString("name", sessionData.name)
                    putString("phone", sessionData.phone)
                    putString("token", token)
                }
                loadBundle("home", homeBundle)
            }
            "LOGOUT" -> {
                SessionManager(context).clearSession()
                loadBundle("login", null)
            }
            "OPEN_TRANSFER" -> {
                val sessionBundle = getSessionBundle()
                val homeBundle = Bundle()
                if (sessionBundle != null) {
                    homeBundle.putAll(sessionBundle)
                }
                homeBundle.putString("token", data?.getString("token") ?: token)
                loadBundle("transfer", homeBundle)
            }
            "OPEN_MOVEMENTS" -> {
                val sessionBundle = getSessionBundle()
                val homeBundle = Bundle()
                if (sessionBundle != null) {
                    homeBundle.putAll(sessionBundle)
                }
                homeBundle.putString("token", data?.getString("token") ?: token)
                loadBundle("movements", homeBundle)
            }
            "BACK" -> {
                val sessionBundle = getSessionBundle()
                val homeBundle = Bundle()
                if (sessionBundle != null) {
                    homeBundle.putAll(sessionBundle)
                }
                homeBundle.putString("token", data?.getString("token") ?: token)
                loadBundle("home", homeBundle)
            }
            "TRANSFER_SUCCESS" -> {
                val homeBundle = Bundle().apply {
                    putString("userId", data?.getString("userId"))
                    putString("name", data?.getString("name"))
                    putString("phone", data?.getString("phone"))
                    putString("token", data?.getString("token"))
                }
                loadBundle("home", homeBundle)
            }
            "SESSION_EXPIRED" -> {
                SessionManager(context).clearSession()
                loadBundle("login", null)
            }
        }
    }

    fun onHostResume(activity: AppCompatActivity) {
        devInstanceManager?.onHostResume(activity, null)
        reactInstanceManagers.values.forEach { it.onHostResume(activity, null) }
    }

    fun onHostPause() {
        devInstanceManager?.onHostPause()
        reactInstanceManagers.values.forEach { it.onHostPause() }
    }

    fun destroy() {
        reactInstanceManagers.values.forEach { it.onHostDestroy() }
        reactInstanceManagers.clear()
        rootViews.clear()
        devInstanceManager?.onHostDestroy()
        devRootView = null
    }
}