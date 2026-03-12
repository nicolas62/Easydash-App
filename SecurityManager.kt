package com.jeedom.connect.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecurityManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "jeedom_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveApiKey(apiKey: String) {
        sharedPreferences.edit().putString("api_key", apiKey).apply()
    }

    fun getApiKey(): String? {
        return sharedPreferences.getString("api_key", null)
    }

    fun saveUrl(url: String) {
        sharedPreferences.edit().putString("jeedom_url", url).apply()
    }

    fun getUrl(): String? {
        return sharedPreferences.getString("jeedom_url", "")
    }
}