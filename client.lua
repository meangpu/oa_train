local isOpenUI = false
local scriptName = GetCurrentResourceName()
local isWaitTeleport = false
local waitTeleportSecondsLeft = 0
local waitTeleportDrawCoords = nil
local waitTeleportToStationKey = nil

local interactDistance = Config.InteractDistance or 3.0
local BlipData = {}
local nearNpc = false
local TrainSounds = { "TrainGetIn.mp3", "TrainGetOut.mp3" }

local trainUseCooldownEndsAt = nil -- nil = not yet synced from server; 0 = no active cooldown

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

local function CreateBlipMapIcon(location)
    local coords = location.npcLocation
    local blip = BlipAddForCoords(1664425300, coords.x, coords.y, coords.z)
    SetBlipSprite(blip, Config.BlipIcon)
    SetBlipScale(blip, 1.0)
    SetBlipName(blip, location.label)
    table.insert(BlipData, blip)
end

AddEventHandler("onClientResourceStart", function(resource)
    if scriptName ~= resource then return end
    for _, v in pairs(Config.Location) do
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
local function GetPlayerDistanceToPos(pos, fromCoords)
    fromCoords = fromCoords or GetEntityCoords(PlayerPedId())
    local dx = fromCoords.x - pos.x
    local dy = fromCoords.y - pos.y
    local dz = fromCoords.z - pos.z
    return math.sqrt(dx * dx + dy * dy + dz * dz)
end

local function IsPlayerNearLocation(coords, playerCoords)
    return GetPlayerDistanceToPos(coords, playerCoords) < interactDistance
end

local function findClosestStationKey(playerCoords)
    local closestKey = nil
    local minDistSq = math.huge
    for key, location in pairs(Config.Location) do
        local npc = location.npcLocation
        local dx = playerCoords.x - npc.x
        local dy = playerCoords.y - npc.y
        local dz = playerCoords.z - npc.z
        local distSq = (dx * dx) + (dy * dy) + (dz * dz)
        if distSq < minDistSq then
            minDistSq = distSq
            closestKey = key
        end
    end

    return closestKey
end

local function SentPlayerMoneyToUI()
    local playerMoney = LocalPlayer.state.Character.Money
    SendNUIMessage({
        type = "SetPlayerMoney",
        money = playerMoney
    })
end

local function getTrainUseCooldownSecondsLeft()
    if trainUseCooldownEndsAt == nil or trainUseCooldownEndsAt <= 0 then
        return 0
    end
    local secondsLeft = trainUseCooldownEndsAt - GetCloudTimeAsInt()
    if secondsLeft <= 0 then
        trainUseCooldownEndsAt = 0
        return 0
    end
    return math.floor(secondsLeft)
end

local function syncUserCooldownToUI()
    SendNUIMessage({
        type = "SetUserCooldown",
        secondsLeft = getTrainUseCooldownSecondsLeft(),
    })
end

local function RequestUserCooldownFromServer()
    if trainUseCooldownEndsAt ~= nil then
        syncUserCooldownToUI()
        return
    end
    TriggerServerEvent(eventName("RequestUserCooldown"))
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
    SentPlayerMoneyToUI()
    SendPlayerLocationToUI()
    RequestUserCooldownFromServer()
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(true)
    SendNUIMessage({ type = "OpenUI" })
    isOpenUI = true
end

local function TeleportToLocation(loc)
    DoScreenFadeOut(1000)
    while IsScreenFadingOut() do
        Wait(0)
    end
    local ped = PlayerPedId()
    SetEntityCoords(ped, loc.x, loc.y, loc.z, true, true, false, false)
    if loc.w then
        SetEntityHeading(ped, loc.w)
    end
    Wait(1500)
    DoScreenFadeIn(2000)
    SendPlayerLocationToUI()
    SentPlayerMoneyToUI()
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
    SetTextScale(0.33, 0.33)
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

local function PlayUIAudio(audioName)
    SendNUIMessage({ type = "PlayAudio", audioName = audioName })
end

local function PlayRandomTrainSound()
    PlayUIAudio(TrainSounds[math.random(1, #TrainSounds)])
end

local function getStationDisplayName(stationKey)
    if not stationKey then return "station" end

    local station = Config.Location[string.upper(stationKey)]
    if station and station.label then
        return station.label
    end

    return stationKey
end

local function getWaitTeleportDisplayText()
    local stationName = getStationDisplayName(waitTeleportToStationKey)
    return string.format(
        "To %s in %d ...",
        stationName,
        waitTeleportSecondsLeft
    )
end

local function FreezePlayer(waitSeconds, onComplete, toStationKey)
    if isWaitTeleport then
        NotifyPlayer("กำลังรออยู่แล้ว")
        return false
    end
    waitSeconds = tonumber(waitSeconds) or 0
    if waitSeconds < 1 then
        if onComplete then onComplete() end
        return true
    end
    local ped = PlayerPedId()
    isWaitTeleport = true
    waitTeleportSecondsLeft = math.floor(waitSeconds)
    waitTeleportToStationKey = toStationKey
    waitTeleportDrawCoords = GetEntityCoords(ped)
    FreezeEntityPosition(ped, true)
    SetEntityAlpha(ped, 150, false)
    ClearPedTasks(ped)
    CreateThread(function()
        while waitTeleportSecondsLeft > 0 do
            Wait(1000)
            waitTeleportSecondsLeft = waitTeleportSecondsLeft - 1
        end
        PlayRandomTrainSound()
        if onComplete then onComplete() end
        Wait(1000)
        SetEntityAlpha(ped, 255, false)
        FreezeEntityPosition(ped, false)
        isWaitTeleport = false
        waitTeleportDrawCoords = nil
        waitTeleportToStationKey = nil
    end)
    return true
end

--========================================
--  Event Listeners,
--========================================

RegisterNetEvent("oa_toggleUI", function(isHide)
    SendNUIMessage({ type = 'SetGlobalShow', show = not isHide })
end)

RegisterNetEvent("oa_lib:forceCloseNuiFocus", function()
    CloseUI()
end)

RegisterNetEvent(eventName("ReceiveUserCooldown"), function(cooldownEndsAt)
    cooldownEndsAt = tonumber(cooldownEndsAt) or 0
    if cooldownEndsAt > 0 and cooldownEndsAt <= GetCloudTimeAsInt() then
        cooldownEndsAt = 0
    end
    trainUseCooldownEndsAt = cooldownEndsAt
    syncUserCooldownToUI()
end)

RegisterNetEvent(eventName("TeleportToStationApproved"), function(data)
    if not data or not data.toStationKey then return end
    if isWaitTeleport then return end

    CloseUI()
    SentPlayerMoneyToUI()

    local toStationKey = data.toStationKey
    local waitSeconds = tonumber(data.waitSeconds) or 0

    FreezePlayer(waitSeconds, function()
        TeleportToStation(toStationKey)
    end, toStationKey)
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
        NotifyPlayer("location not found")
        cb('ok')
        return
    end

    if isWaitTeleport then
        NotifyPlayer("กำลังรออยู่แล้ว")
        cb('ok')
        return
    end

    locationKey = string.upper(locationKey)
    local playerCoords = GetEntityCoords(PlayerPedId())
    local fromKey = findClosestStationKey(playerCoords)
    if not fromKey then
        NotifyPlayer("ไม่พบสถานีใกล้เคียง")
        cb('ok')
        return
    end

    if fromKey == locationKey then
        NotifyPlayer("คุณอยู่ที่สถานีนี้อยู่แล้ว")
        cb('ok')
        return
    end

    TriggerServerEvent(eventName("RequestTeleportToStation"), fromKey, locationKey)
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
            local displayText = getWaitTeleportDisplayText()
            DrawText3D(
                waitTeleportDrawCoords.x,
                waitTeleportDrawCoords.y,
                waitTeleportDrawCoords.z + 0.97,
                displayText,
                string.len(displayText)
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
        if isOpenUI then
            Wait(500)
        else
            nearNpc = false
            local playerCoords = GetEntityCoords(PlayerPedId())
            for _, location in pairs(Config.Location) do
                if IsPlayerNearLocation(location.npcLocation, playerCoords) then
                    nearNpc = true
                    break
                end
            end
            if nearNpc and not isWaitTeleport then
                exports["oa_helptext"]:Help('กด R เพื่อดูรายการสถานีรถไฟ')
                if IsControlJustPressed(0, Config.InteractionKey) then
                    OpenUI()
                end
            end
            Wait(nearNpc and 7 or 1000)
        end
    end
end)

--========================================
--  Commands
--========================================
RegisterCommand("train_close", CloseUI, false)
-- RegisterCommand("train_open", OpenUI, false)
