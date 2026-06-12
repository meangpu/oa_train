local scriptName = GetCurrentResourceName()
local vorpCore = exports.vorp_core:GetCore()
local teleportCooldownBySteamHex = {}

AddEventHandler("onResourceStart", function(resource)
    if scriptName ~= resource then return end
    print(scriptName .. ": server start")
end)

local function eventName(name) return ('%s:%s'):format(scriptName, name) end
local function NotifyPlayer(source, message) TriggerClientEvent("vorp:TipRight", source, message) end
local function LogDataDog(message, source)
    print(message)
    TriggerEvent('oa_logs:sendtodiscord', scriptName, message, source)
end

local function getPlayerSteamHex(Character)
    return Character and Character.identifier or nil
end

local function GetPlayerVipTier(steamHex, cb)
    if not steamHex then
        if cb then cb(nil) end
        return
    end
    exports.oa_vip_reward:GetHighestVipTier(steamHex, function(tier)
        if cb then cb(tier) end
    end)
end

local function getCooldownMsForVipTier(vipTier)
    if type(vipTier) == "string" and Config.WaitTime[vipTier] then
        return Config.WaitTime[vipTier]
    end
    return Config.WaitTime.default
end

local function getPlayerCooldownMs(Character, cb)
    local steamHex = getPlayerSteamHex(Character)
    if not steamHex then
        if cb then cb(Config.WaitTime.default) end
        return
    end
    GetPlayerVipTier(steamHex, function(tier)
        if cb then cb(getCooldownMsForVipTier(tier)) end
    end)
end

local function getCooldownEndsAt(steamHex)
    local finishAt = teleportCooldownBySteamHex[steamHex]
    if not finishAt then return 0 end
    if finishAt <= os.time() then
        teleportCooldownBySteamHex[steamHex] = nil
        return 0
    end
    return finishAt
end

local function getCooldownSecondsLeft(steamHex)
    local finishAt = getCooldownEndsAt(steamHex)
    if finishAt <= 0 then return 0 end
    return finishAt - os.time()
end

local function isOnCooldown(steamHex)
    return getCooldownSecondsLeft(steamHex) > 0
end

local function setCooldown(steamHex, cooldownMs)
    if not steamHex then return end
    local cooldownSeconds = math.ceil((tonumber(cooldownMs) or 0) / 1000)
    if cooldownSeconds < 1 then return end
    teleportCooldownBySteamHex[steamHex] = os.time() + cooldownSeconds
end

local function formatCooldownRemaining(seconds)
    seconds = math.ceil(tonumber(seconds) or 0)
    if seconds <= 0 then return "0 วินาที" end

    local hours = math.floor(seconds / 3600)
    local minutes = math.floor((seconds % 3600) / 60)
    local secs = seconds % 60

    if hours > 0 then
        return string.format("%d ชม. %d นาที", hours, minutes)
    end
    if minutes > 0 then
        return string.format("%d นาที %d วินาที", minutes, secs)
    end
    return string.format("%d วินาที", secs)
end

local function GetDistanceBetweenCoords(a, b)
    local dx = a.x - b.x
    local dy = a.y - b.y
    local dz = a.z - b.z
    return math.sqrt((dx * dx) + (dy * dy) + (dz * dz))
end

local function roundDownToHundred(value)
    return math.floor(value / 100) * 100
end

local function getTravelCost(distance)
    return roundDownToHundred(math.floor(distance + 0.5))
end

local function getWaitTimeSeconds(cost)
    return math.floor(cost / 100)
end

local function getTravelDetails(fromStationKey, toStationKey)
    local fromStation = Config.Location[fromStationKey]
    local toStation = Config.Location[toStationKey]
    if not fromStation or not toStation then return nil end

    local fromNpc = fromStation.npcLocation
    local toNpc = toStation.npcLocation
    local distance = GetDistanceBetweenCoords(
        { x = fromNpc.x, y = fromNpc.y, z = fromNpc.z },
        { x = toNpc.x, y = toNpc.y, z = toNpc.z }
    )
    local cost = getTravelCost(distance)
    return {
        cost = cost,
        waitSeconds = getWaitTimeSeconds(cost),
    }
end

local function LogGuardWithSource(message, source)
    local success, error = pcall(function()
        exports.oa_guard:discordLogWithSource(message, source)
    end)
    if not success then
        print("LogGuard error: " .. tostring(error))
    end
end

--==========================
--  Event Handlers
--==========================

RegisterServerEvent(eventName("RequestTeleportToStation"), function(fromStationKey, toStationKey)
    local _source = source
    fromStationKey = fromStationKey and string.upper(tostring(fromStationKey)) or nil
    toStationKey = toStationKey and string.upper(tostring(toStationKey)) or nil

    if not toStationKey or not Config.Location[toStationKey] then
        NotifyPlayer(_source, "ไม่พบสถานีปลายทาง")
        return
    end

    if not fromStationKey or not Config.Location[fromStationKey] then
        NotifyPlayer(_source, "ไม่พบสถานีต้นทาง")
        return
    end

    if fromStationKey == toStationKey then
        NotifyPlayer(_source, "คุณอยู่ที่สถานีนี้อยู่แล้ว")
        return
    end

    local ped = GetPlayerPed(_source)
    if not ped or ped == 0 then return end

    local playerCoords = GetEntityCoords(ped)
    local fromNpc = Config.Location[fromStationKey].npcLocation
    local distToFrom = GetDistanceBetweenCoords(
        { x = playerCoords.x, y = playerCoords.y, z = playerCoords.z },
        { x = fromNpc.x, y = fromNpc.y, z = fromNpc.z }
    )

    local details = getTravelDetails(fromStationKey, toStationKey)
    if not details then
        NotifyPlayer(_source, "ไม่สามารถคำนวณการเดินทางได้")
        return
    end

    local User = vorpCore.getUser(_source)
    if not User or not User.getUsedCharacter then
        NotifyPlayer(_source, "ไม่พบข้อมูลตัวละคร")
        return
    end

    local Character = User.getUsedCharacter
    local playerName = (Character.firstname or "unknown") .. " " .. (Character.lastname or "unknown")
    local steamHex = getPlayerSteamHex(Character)
    if not steamHex then
        NotifyPlayer(_source, "ไม่พบข้อมูลผู้เล่น")
        return
    end

    if distToFrom >= (Config.InteractDistance + 1.0 or 3.0) then
        LogGuardWithSource(
            playerName ..
            "พยายามใช้รถไฟ โดยที่ตัวไม่อยู่ใกล้สถานี ตัวอยู่ที่ " ..
            json.encode(playerCoords) .. " แต่ขอไปที่สถานี " .. toStationKey, _source)

        NotifyPlayer(_source, "คุณต้องอยู่ใกล้สถานีรถไฟ")
        return
    end


    if isOnCooldown(steamHex) then
        local secondsLeft = getCooldownSecondsLeft(steamHex)
        TriggerClientEvent(eventName("ReceiveUserCooldown"), _source, getCooldownEndsAt(steamHex))
        NotifyPlayer(
            _source,
            ("คุณใช้งานรถไฟได้อีกครั้งใน %s"):format(formatCooldownRemaining(secondsLeft))
        )
        return
    end

    local playerMoney = Character.money or 0
    if playerMoney < details.cost then
        LogGuardWithSource(
            playerName ..
            "พยายามใช้รถไฟ โดยที่มีเงินไม่พอ มีเงิน " .. playerMoney .. " แต่ต้องการใช้รถไฟ " .. details.cost,
            _source)
        NotifyPlayer(_source, "คุณมีเงินไม่พอ")
        return
    end

    if details.cost > 0 then
        Character.removeCurrency(0, details.cost)
    end

    getPlayerCooldownMs(Character, function(cooldownMs)
        setCooldown(steamHex, cooldownMs)
        TriggerClientEvent(eventName("ReceiveUserCooldown"), _source, getCooldownEndsAt(steamHex))
        local fromLabel = Config.Location[fromStationKey].label or fromStationKey
        local toLabel = Config.Location[toStationKey].label or toStationKey
        LogDataDog(
            ("%s %s -> %s | cost: $%d | wait: %d sec"):format(
                playerName,
                fromLabel,
                toLabel,
                details.cost,
                details.waitSeconds
            ),
            _source
        )
        TriggerClientEvent(eventName("TeleportToStationApproved"), _source, {
            toStationKey = toStationKey,
            waitSeconds = details.waitSeconds,
            cost = details.cost,
        })
    end)
end)

RegisterServerEvent(eventName("RequestUserCooldown"), function()
    local _source = source
    local User = vorpCore.getUser(_source)
    if not User or not User.getUsedCharacter then
        TriggerClientEvent(eventName("ReceiveUserCooldown"), _source, 0)
        return
    end
    local steamHex = getPlayerSteamHex(User.getUsedCharacter)
    TriggerClientEvent(
        eventName("ReceiveUserCooldown"),
        _source,
        getCooldownEndsAt(steamHex)
    )
end)

RegisterServerEvent(eventName("RequestUserVipTier"), function()
    local _source = source
    local User = vorpCore.getUser(_source)
    if not User or not User.getUsedCharacter then
        TriggerClientEvent(eventName("ReceiveUserVipTier"), _source, nil)
        return
    end
    local steamHex = getPlayerSteamHex(User.getUsedCharacter)
    GetPlayerVipTier(steamHex, function(tier)
        TriggerClientEvent(eventName("ReceiveUserVipTier"), _source, tier)
    end)
end)

--==========================
--  Commands
--==========================
RegisterCommand("train_cooldown", function(source, args, rawCommand)
    local _source = source
    local User = vorpCore.getUser(_source)
    if not User or not User.getUsedCharacter then
        NotifyPlayer(_source, "ไม่พบข้อมูลตัวละคร")
        return
    end
    local steamHex = getPlayerSteamHex(User.getUsedCharacter)
    local secondsLeft = getCooldownSecondsLeft(steamHex)
    TriggerClientEvent(eventName("ReceiveUserCooldown"), _source, getCooldownEndsAt(steamHex))
    if secondsLeft > 0 then
        NotifyPlayer(
            _source,
            ("ใช้งานรถไฟได้อีกครั้งใน <green>%s</green>"):format(formatCooldownRemaining(secondsLeft))
        )
    else
        NotifyPlayer(_source, "คุณสามารถใช้งานรถไฟได้แล้ว")
    end
end, false)

RegisterCommand("train_getTier", function(source, args, rawCommand)
    local _source = source
    local User = vorpCore.getUser(_source)
    if not User or not User.getUsedCharacter then
        NotifyPlayer(_source, "ไม่พบข้อมูลตัวละคร")
        return
    end
    local steamHex = getPlayerSteamHex(User.getUsedCharacter)
    print(steamHex)
    GetPlayerVipTier(steamHex, function(tier)
        print(tier)
    end)
end, false)
