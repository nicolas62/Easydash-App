package com.jeedom.connect.model

data class JeedomEqLogic(
    val id: String,
    val name: String,
    val cmds: List<JeedomCommand>
)

data class JeedomCommand(
    val id: String,
    val name: String,
    val type: String,
    val subType: String,
    val generic_type: String?,
    val value: Any?,
    val unite: String
)

data class RpcRequest(
    val jsonrpc: String = "2.0",
    val method: String,
    val params: Map<String, Any>,
    val id: String
)

data class RpcResponse(
    val jsonrpc: String,
    val result: Any?,
    val id: String
)