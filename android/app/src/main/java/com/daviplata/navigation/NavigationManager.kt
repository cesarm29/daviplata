package com.daviplata.navigation

import android.app.Application
import android.content.Context
import android.os.Bundle
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.daviplata.BuildConfig
import com.daviplata.bridge.DaviplataPackage
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactRootView
import com.facebook.react.common.LifecycleState
import com.facebook.react.shell.MainReactPackage

class NavigationManager(private val context: Context) {

    private val reactInstanceManagers = mutableMapOf<String, ReactInstanceManager>()
    private val rootViews = mutableMapOf<String, ReactRootView>()

    fun loadBundle(name: String, initialProps: Bundle?) {
        val activity = context as? AppCompatActivity ?: return

        val rootView = ReactRootView(context)
        val reactInstanceManager = getOrCreateInstanceManager(name)
        val appComponent = "${name.replaceFirstChar { it.uppercase() }}Bundle"

        val props = initialProps ?: Bundle()

        rootView.startReactApplication(reactInstanceManager, appComponent, props)

        val container = FrameLayout(context).apply {
            id = android.view.View.generateViewId()
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

    fun handleEvent(event: String, data: Bundle?) {
        when (event) {
            "LOGIN_SUCCESS" -> {
                val sessionData = com.daviplata.session.SessionData(
                    sessionId = data?.getString("sessionId") ?: "",
                    userId = data?.getString("userId") ?: "",
                    name = data?.getString("name") ?: "",
                    phone = data?.getString("phone") ?: "",
                    expiresAt = System.currentTimeMillis() + 86400000
                )
                com.daviplata.session.SessionManager(context).saveSession(sessionData)
                loadBundle("home", data)
            }
            "LOGOUT" -> {
                com.daviplata.session.SessionManager(context).clearSession()
                loadBundle("login", null)
            }
            "OPEN_TRANSFER" -> loadBundle("transfer", data)
            "OPEN_MOVEMENTS" -> loadBundle("movements", data)
            "BACK" -> loadBundle("home", data)
            "TRANSFER_SUCCESS" -> {
                val homeData = Bundle().apply {
                    putString("name", data?.getString("name"))
                    putString("phone", data?.getString("phone"))
                    putString("userId", data?.getString("userId"))
                }
                loadBundle("home", homeData)
            }
        }
    }

    fun destroy() {
        reactInstanceManagers.values.forEach { it.onHostDestroy() }
        reactInstanceManagers.clear()
        rootViews.clear()
    }
}
