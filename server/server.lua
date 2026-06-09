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

local function DebugPrint(message)
    if not Config.DebugPrintServer then return end
    print(message)
end


local function LogGuardWithSource(message, source)
    local success, error = pcall(function()
        exports.oa_guard:discordLogWithSource(message, source)
    end)
    if not success then
        DebugPrint("LogGuard error: " .. tostring(error))
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
RegisterServerEvent(eventName("RequestClientData"), function()
    local _source = source
    local User = vorpCore.getUser(_source)
    if not User or not User.getUsedCharacter then
        TriggerClientEvent(eventName("ReceiveClientData"), _source, nil)
        return
    end
    local Character = User.getUsedCharacter
    local DataToSend = {
        myName = (Character.firstname or "") .. " " .. (Character.lastname or ""),
        steamHex = Character.identifier
    }
    TriggerClientEvent(eventName("ReceiveClientData"), _source, DataToSend)
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
    DebugPrint(logword)
    LogDataDog(logword, _source)
end, true)


RegisterCommand("t_db_insert", function(source, args, rawCommand)
    local data = args and args[1] or nil
    local message = args and args[2] or nil
    if not data or data == "" or not message or message == "" then
        return print("t_db_insert usage: t_db_insert <data> <message>")
    end
    db.insertTestData(data, message, function(insertId)
        print("t_db_insert: insertId=" .. tostring(insertId))
    end)
end, true)

RegisterCommand("t_db_get", function(source, args, rawCommand)
    local id = args and args[1] or nil
    if not id or id == "" then return print("t_db_get usage: t_db_get <id>") end

    db.getTestByID(id, function(row)
        print("t_db_get: row=" .. (json and json.encode and json.encode(row) or tostring(row)))
    end)
end, true)

RegisterCommand("t_db_update", function(source, args, rawCommand)
    local id = args and args[1] or nil
    local message = args and args[2] or nil
    if not id or id == "" or not message or message == "" then
        return print("t_db_update usage: t_db_update <id> <message>")
    end
    db.updateTestMessage(id, message, function(affected)
        print("t_db_update: affected=" .. tostring(affected))
    end)
end, true)

RegisterCommand("t_db_delete", function(source, args, rawCommand)
    local id = args and args[1] or nil
    if not id or id == "" then return print("t_db_delete usage: t_db_delete <id>") end
    db.deleteTestId(id, function(affected)
        print("t_db_delete: affected=" .. tostring(affected))
    end)
end, true)


RegisterCommand("t_buy_tebex", function(source, args, rawCommand)
    -- source จะเป็น 0 เพราะเป็นคำสั่งจาก console
    -- args[1] ที่ setup ในเว็ปต้องเป็น id ละมันจะเป็น fiveM:id ของคนเล่น
    local fivemId = args[1]
    if not fivemId then return print("fivemId not found") end
    local _source = exports.oa_lib:getSourceFromFivemId(fivemId)
    if not _source then return print("source not found") end
    -- LogDataDog()
    -- log discord
end, true)


--==========================
--  End of Script
--==========================
