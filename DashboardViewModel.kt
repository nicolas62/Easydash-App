package com.jeedom.connect.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.jeedom.connect.api.JeedomApi
import com.jeedom.connect.model.JeedomEqLogic
import com.jeedom.connect.security.SecurityManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val securityManager = SecurityManager(application)
    private val _eqLogics = MutableStateFlow<List<JeedomEqLogic>>(emptyList())
    val eqLogics: StateFlow<List<JeedomEqLogic>> = _eqLogics

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing

    private val _batteryAlert = MutableStateFlow<String?>(null)
    val batteryAlert: StateFlow<String?> = _batteryAlert

    private var api: JeedomApi? = null

    init {
        updateApiInstance()
        refreshData()
    }

    private fun updateApiInstance() {
        val url = securityManager.getUrl() ?: return
        if (url.isNotEmpty()) {
            api = Retrofit.Builder()
                .baseUrl(if (url.endsWith("/")) url else "$url/")
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(JeedomApi::class.java)
        }
    }

    fun refreshData() {
        val apiKey = securityManager.getApiKey() ?: return
        val currentApi = api ?: return

        viewModelScope.launch {
            _isRefreshing.value = true
            try {
                val response = currentApi.getFullData(apiKey)
                if (response.isSuccessful) {
                    val data = response.body() ?: emptyList()
                    _eqLogics.value = data
                    checkBatteries(data)
                }
            } catch (e: Exception) {
                // Gérer erreur
            } finally {
                _isRefreshing.value = false
            }
        }
    }

    private fun checkBatteries(data: List<JeedomEqLogic>) {
        val lowBatteries = mutableListOf<String>()
        data.forEach { eq ->
            eq.cmds.forEach { cmd ->
                if (cmd.generic_type == "BATTERY" || cmd.name.contains("Batterie", ignoreCase = true)) {
                    val value = cmd.value?.toString()?.toDoubleOrNull()
                    if (value != null && value < 20.0) {
                        lowBatteries.add("${eq.name} ($value%)")
                    }
                }
            }
        }
        if (lowBatteries.isNotEmpty()) {
            _batteryAlert.value = "Batterie faible sur : ${lowBatteries.joinToString(", ")}"
        }
    }

    fun saveConfig(url: String, key: String) {
        securityManager.saveUrl(url)
        securityManager.saveApiKey(key)
        updateApiInstance()
        refreshData()
    }
    
    fun clearBatteryAlert() {
        _batteryAlert.value = null
    }
}