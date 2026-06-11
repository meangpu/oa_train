local scriptName = GetCurrentResourceName()
local vorpCore = exports.vorp_core:GetCore()
local vorpInventory = exports.vorp_inventory:vorp_inventoryApi()

AddEventHandler("onResourceStart", function(resource)
    if scriptName ~= resource then return end
    print(scriptName .. ": server start")
end)

local function eventName(name) return ('%s:%s'):format(scriptName, name) end
local function NotifyPlayer(source, message) TriggerClientEvent("vorp:TipRight", source, message) end
local function LogDataDog(message, source) TriggerEvent('oa_logs:sendtodiscord', scriptName, message, source) end


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

local function CheckAdmin(source)
    local User = vorpCore.getUser(source)
    if not User or not User.getUsedCharacter then
        return false
    end
    local Character = User.getUsedCharacter
    local name = (Character.firstname or "") .. " " .. (Character.lastname or "")
    -- DISCORD here
    if Character.group ~= 'admin' then
        LogGuardWithSource("มีคนพยายามใช้ me_admin โดยไม่ใช่ admin คนนั้นคือ [" .. name .. "]", source)
        exports.oa_guard:DoKick(source)
        return false
    end
    return true
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

    if distToFrom >= (Config.InteractDistance or 3.0) then
        NotifyPlayer(_source, "คุณต้องอยู่ใกล้สถานีรถไฟ")
        return
    end

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
    local playerMoney = Character.money or 0
    if playerMoney < details.cost then
        NotifyPlayer(_source, "คุณมีเงินไม่พอ")
        return
    end

    if details.cost > 0 then
        Character.removeCurrency(0, details.cost)
    end

    TriggerClientEvent(eventName("TeleportToStationApproved"), _source, {
        toStationKey = toStationKey,
        waitSeconds = details.waitSeconds,
        cost = details.cost,
    })
end)
--==========================
--  Commands
--==========================
RegisterCommand("t_addItem", function(source, args, rawCommand)
    local _source = source
    if not CheckAdmin(_source) then return end
    local itemCount = 1
    local itemName = "bread"
    local canCarry = vorpInventory.canCarryItem(_source, itemName, itemCount)
    if not canCarry then
        NotifyPlayer(_source, ("<red-bg>%s</red-bg> เต็มกระเป๋าแล้ว"):format(itemName))
        return
    end
    vorpInventory.addItem(_source, itemName, itemCount)
    local logword = ("เพิ่ม %sx%d"):format(itemName, itemCount)
    NotifyPlayer(_source, ("เพิ่ม %s <green-bg>x%d</green-bg>"):format(itemName, itemCount))
    LogDataDog(logword, _source)
end, true)


--==========================
--  End of Script
--==========================
