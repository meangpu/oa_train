local isOpenUI = false
local scriptName = GetCurrentResourceName()
local isWaitTeleport = false
local waitTeleportSecondsLeft = 0
local waitTeleportDrawCoords = nil

local interactDistance = 3
local BlipData = {}

--========================================
--  Enable Controls
--========================================
local uiControlsToEnable = {
    GetHashKey("INPUT_PUSH_TO_TALK"),
    GetHashKey("INPUT_AIM_IN_AIR") -- U
}
local freezeControlsToEnable = {
    GetHashKey("INPUT_PUSH_TO_TALK"),
    GetHashKey("INPUT_AIM_IN_AIR"), -- U
    GetHashKey("INPUT_LOOK_LR"),
    GetHashKey("INPUT_LOOK_UD"),
}
--========================================
--  Enable Controls
--========================================

AddEventHandler("onClientResourceStart", function(resource)
    if scriptName ~= resource then return end
    print(scriptName .. ": client start")
    for k, v in pairs(Config.Location) do
        CreateBlipMapIcon(v)
    end
end)

AddEventHandler("onResourceStop", function(resource)
    if scriptName ~= resource then return end
    for _, blip in pairs(BlipData) do
        if blip then RemoveBlip(blip) end
    end
end)

--========================================
-- Function
--========================================

local function eventName(name) return ('%s:%s'):format(scriptName, name) end
local function NotifyPlayer(message) TriggerEvent("vorp:TipRight", message) end
local function GetPlayerDistanceToPos(pos) return #(GetEntityCoords(PlayerPedId()) - pos) end

local function CreateBlipMapIcon(location)
    print(json.encode(location, { indent = true }))
    local blip = BlipAddForCoords(Config.BlipIcon, location.npcLocation.x, location.npcLocation.y,
        location.npcLocation.z)
    SetBlipSprite(blip, Config.BlipIcon)
    SetBlipScale(blip, 1.0)
    SetBlipName(blip, location.label)
    table.insert(BlipData, blip)
end

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

local function SendPlayerLocationToUI()
    -- {"x":-1644.4381103515626,"y":-1393.212646484375,"z":83.19735717773438}
    local pCoord = GetEntityCoords(PlayerPedId())
    SendNUIMessage({ type = "SetPlayerLocation", playerLocation = pCoord, })
end


local function CloseUI()
    SendNUIMessage({ type = "CloseUI" })
    isOpenUI = false
    SetNuiFocus(false, false)
end

local function OpenUI()
    SendNUIMessage({ type = "OpenUI" })
    isOpenUI = true
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)
    SendPlayerInvToUI()
    SendPlayerLocationToUI()
end

local function ChangeUINavPage(page)
    SendNUIMessage({ type = "ChangeUINavPage", page = page })
end

local function TeleportToLocation(loc)
    DoScreenFadeOut(500)
    while IsScreenFadingOut() do
        Wait(0)
    end
    local ped = PlayerPedId()
    SetEntityCoords(ped, loc.x, loc.y, loc.z, true, true, false, false)
    if loc.w then
        SetEntityHeading(ped, loc.w)
    end
    Wait(1000)
    DoScreenFadeIn(500)
    SendPlayerLocationToUI()
end

local function TeleportToStation(locationKey)
    local station = Config.Location[string.upper(locationKey)]
    if not station then
        NotifyPlayer("Unknown station: " .. tostring(locationKey))
        return false
    end
    TeleportToLocation(station.exitLocation)
    return true
end

local drawTextScreenX, drawTextScreenY
local DRAW_TEXT_MOVE_THRESHOLD = 0.002
local DRAW_TEXT_SMOOTH_FACTOR = 0.2

local function resetDrawTextScreen()
    drawTextScreenX, drawTextScreenY = nil, nil
end

local function dampScreenCoord(rawX, rawY)
    if not drawTextScreenX then
        drawTextScreenX, drawTextScreenY = rawX, rawY
        return rawX, rawY
    end
    local dx = rawX - drawTextScreenX
    local dy = rawY - drawTextScreenY
    if math.abs(dx) < DRAW_TEXT_MOVE_THRESHOLD and math.abs(dy) < DRAW_TEXT_MOVE_THRESHOLD then
        return drawTextScreenX, drawTextScreenY
    end
    drawTextScreenX = drawTextScreenX + dx * DRAW_TEXT_SMOOTH_FACTOR
    drawTextScreenY = drawTextScreenY + dy * DRAW_TEXT_SMOOTH_FACTOR
    return drawTextScreenX, drawTextScreenY
end

local function DrawText3D(x, y, z, text, bgWidth)
    local onScreen, rawX, rawY = GetScreenCoordFromWorldCoord(x, y, z)
    if not onScreen then
        resetDrawTextScreen()
        return
    end
    local _x, _y = dampScreenCoord(rawX, rawY)
    local str = CreateVarString(10, "LITERAL_STRING", text, Citizen.ResultAsLong())
    SetTextScale(0.30, 0.30)
    SetTextFontForCurrentCommand(1)
    SetTextColor(255, 255, 255, 215)
    SetTextCentre(true)
    DisplayText(str, _x, _y)
    local factor = (bgWidth or string.len(text)) / 225
    DrawSprite("feeds", "hud_menu_4a", _x, _y + 0.0125, 0.015 + factor, 0.03, 0.1, 35, 35, 35, 190, false)
end


local function ApplyLimitedControls(enableList)
    DisableAllControlActions(0)
    for _, controlHash in ipairs(enableList) do
        EnableControlAction(0, controlHash, true)
    end
end

local function ToggleUI()
    if isOpenUI then
        CloseUI()
    else
        OpenUI()
    end
end

local function PlayUIAudio(audioName)
    SendNUIMessage({ type = "PlayAudio", audioName = audioName })
end

local function FreezePlayer()
    local ped = PlayerPedId()
    isWaitTeleport = true
    waitTeleportSecondsLeft = 10
    waitTeleportDrawCoords = GetEntityCoords(ped)
    FreezeEntityPosition(ped, true)
    SetEntityAlpha(ped, 150, false)
    ClearPedTasks(ped)
    PlayUIAudio("TrainGetIn.mp3")
    CreateThread(function()
        while waitTeleportSecondsLeft > 0 do
            Wait(1000)
            waitTeleportSecondsLeft = waitTeleportSecondsLeft - 1
        end
        SetEntityAlpha(ped, 255, false)
        FreezeEntityPosition(ped, false)
        isWaitTeleport = false
        waitTeleportDrawCoords = nil
        PlayUIAudio("TrainGetOut.mp3")
    end)
end

--========================================
--  Data Fetching
--========================================

--========================================
--  Event Listeners,
--========================================
RegisterNetEvent(eventName("ReceiveClientData"), function(data)
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

RegisterNUICallback("TeleportToStation", function(data, cb)
    local locationKey = data.locationKey
    if not locationKey then
        return NotifyPlayer("location not found")
    end
    TeleportToStation(locationKey)
    cb('ok')
end)

RegisterNUICallback("NUILoaded", function(_, cb)
    SendNUIMessage({
        type = "SetupConfig",
        locations = Config.Location,
    })
    cb('ok')
end)

CreateThread(function()
    while true do
        if isWaitTeleport and waitTeleportSecondsLeft > 0 and waitTeleportDrawCoords then
            DrawText3D(
                waitTeleportDrawCoords.x,
                waitTeleportDrawCoords.y,
                waitTeleportDrawCoords.z + 1.1,
                string.format("%d", waitTeleportSecondsLeft),
                1
            )
            Wait(0)
        else
            resetDrawTextScreen()
            Wait(500)
        end
    end
end)

CreateThread(function()
    while true do
        local controlsToEnable
        if isWaitTeleport then
            controlsToEnable = freezeControlsToEnable
        elseif isOpenUI then
            controlsToEnable = uiControlsToEnable
        end
        if controlsToEnable then
            ApplyLimitedControls(controlsToEnable)
            Wait(7)
        else
            Wait(500)
        end
    end
end)

CreateThread(function()
    while true do
        if IsControlJustPressed(0, GetHashKey("INPUT_AIM_IN_AIR")) then -- key u INPUT_AIM_IN_AIR
            -- ToggleUI()
            FreezePlayer()
        end
        Citizen.Wait(7)
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

RegisterCommand("train_close", CloseUI, false)
RegisterCommand("train_open", OpenUI, false)
RegisterCommand("train_teleport", function(_, args)
    local locationKey = args[1]
    if not locationKey then
        NotifyPlayer("Usage: /train_teleport ANNESBURG")
        return
    end
    TeleportToStation(locationKey)
end, false)
