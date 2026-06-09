local isOpenUI = false
local scriptName = GetCurrentResourceName()

AddEventHandler("onClientResourceStart", function(resource)
    if scriptName ~= resource then return end
    print(scriptName .. ": client start")
end)

--========================================
-- Function
--========================================

local function DebugPrint(message)
    if not Config.DebugPrintClient then return end
    print(message)
end
local function eventName(name) return ('%s:%s'):format(scriptName, name) end
local function NotifyPlayer(message) TriggerEvent("vorp:TipRight", message) end
local function GetPlayerDistanceToPos(pos) return #(GetEntityCoords(PlayerPedId()) - pos) end

local function SendPlayerInvToUI()
    local inventoryArray = {}
    local successInv, userInventory = pcall(exports.vorp_inventory.REQ_USERIVENTORY)
    if not successInv then userInventory = {} end
    for _, item in pairs(userInventory) do
        if item and item.name and item.count then
            local label = item.label or item.name
            inventoryArray[#inventoryArray + 1] = {
                name = item.name,
                label = label,
                count = item.count,
                limit = item.limit
            }
        end
    end
    SendNUIMessage({
        type = "SetPlayerInv",
        inventoryData = inventoryArray
    })
end

local function CloseUI()
    SendNUIMessage({ type = "CloseUI" })
    isOpenUI = false
    SetNuiFocus(false, false)
end

local function OpenUI()
    SendNUIMessage({ type = "OpenUI" })
    Wait(100)
    isOpenUI = true
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)
    SendPlayerInvToUI()
end

local function ChangeUINavPage(page)
    SendNUIMessage({ type = "ChangeUINavPage", page = page })
end

local function ToggleUI()
    if isOpenUI then
        CloseUI()
    else
        OpenUI()
    end
end

--========================================
--  Data Fetching
--========================================
local function FetchClientData()
    SendPlayerInvToUI()
    TriggerServerEvent(eventName("RequestClientData"))
end

--========================================
--  Event Listeners,
--========================================
RegisterNetEvent(eventName("ReceiveClientData"), function(data)
    DebugPrint("ReceiveClientData: " .. json.encode(data))
    SendNUIMessage({ type = "SetClientData", clientData = data })
end)

RegisterNetEvent("oa_toggleUI", function(isHide)
    SendNUIMessage({ type = 'SetGlobalShow', show = not isHide })
end)

RegisterNetEvent("oa_lib:forceCloseNuiFocus", function()
    CloseUI()
end)


--========================================
--  NUI Callbacks
--========================================
RegisterNUICallback("NUIFocusOff", function(_, cb)
    CloseUI()
    cb('ok')
end)

RegisterNUICallback("UiTriggerClient", function(_, cb)
    print("Trigger to client from UI")
    FetchClientData()
    cb('ok')
end)

RegisterNUICallback("NUILoaded", function(_, cb)
    -- SendNUIMessage({ type = "SetupConfig", itemTypes = Config.WhitelistedItems })
    cb('ok')
end)

--========================================
--  Enable Controls
--========================================
local controlsToEnable = {
    GetHashKey("INPUT_PUSH_TO_TALK"),
    GetHashKey("INPUT_AIM_IN_AIR") -- U
}

Citizen.CreateThread(function()
    while true do
        if isOpenUI then
            DisableAllControlActions(0)
            for _, controlHash in ipairs(controlsToEnable) do
                EnableControlAction(0, controlHash, true)
            end
        end
        Citizen.Wait(0)
    end
end)

Citizen.CreateThread(function()
    while true do
        if IsControlJustPressed(0, GetHashKey("INPUT_AIM_IN_AIR")) then -- key u INPUT_AIM_IN_AIR
            ToggleUI()
            DebugPrint("U press")
            NotifyPlayer("U press")
        end
        Citizen.Wait(0)
    end
end)

--========================================
--  Commands
--========================================

RegisterCommand("t_coord_check", function(source, args, rawCommand)
    local location = vector3(-5534.63, -2930.89, -1.935)
    local distance = GetPlayerDistanceToPos(location)
    NotifyPlayer("t_coord_check: " .. distance)
end, false)

RegisterCommand("t_fetch", FetchClientData, false)
RegisterCommand("t_close", CloseUI, false)
RegisterCommand("t_open", OpenUI, false)
