package com.facebook.react;

import android.app.Application;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import java.util.Arrays;
import java.util.List;

public class PackageList {
    private Application application;
    private ReactNativeHost reactNativeHost;

    public PackageList(ReactNativeHost reactNativeHost) {
        this.reactNativeHost = reactNativeHost;
    }

    public PackageList(Application application) {
        this.application = application;
    }

    public List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage()
        );
    }
}
