package com.jeedom.connect.api

import com.jeedom.connect.model.JeedomEqLogic
import com.jeedom.connect.model.RpcRequest
import com.jeedom.connect.model.RpcResponse
import retrofit2.Response
import retrofit2.http.*

interface JeedomApi {
    @GET("core/api/jeeApi.php")
    suspend fun getFullData(
        @Query("apikey") apiKey: String,
        @Query("type") type: String = "fullData"
    ): Response<List<JeedomEqLogic>>

    @POST("core/api/jeeApi.php")
    suspend fun executeBatch(
        @Body requests: List<RpcRequest>
    ): Response<List<RpcResponse>>

    @GET("core/api/jeeApi.php")
    suspend fun execCmd(
        @Query("apikey") apiKey: String,
        @Query("type") type: String = "cmd",
        @Query("id") id: String,
        @Query("slider") value: String? = null
    ): Response<Unit>
}