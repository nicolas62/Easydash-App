package com.jeedom.connect

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.jeedom.connect.ui.DashboardScreen
import com.jeedom.connect.ui.theme.JeedomTheme
import com.jeedom.connect.viewmodel.DashboardViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            JeedomTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val dashboardViewModel: DashboardViewModel = viewModel()
                    // Affichage direct du Dashboard sans authentification Firebase
                    // La gestion de la configuration se fait dans le DashboardScreen ou Settings
                    DashboardScreen(dashboardViewModel, onLogout = { 
                        // Optionnel : réinitialiser la config locale ici si nécessaire
                    })
                }
            }
        }
    }
}