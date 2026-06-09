db = db or {}
local scriptName = GetCurrentResourceName()
local cache = {}

local function logError(fnName, message) print(("^1ERROR [%s]^0 %s: %s"):format(scriptName, fnName, message)) end

local function generateCacheKey(id)
    if not id or id == "" then return end
    return ('%s:%s'):format(scriptName, id)
end

db.cache = {
    clear = function()
        for k in pairs(cache) do cache[k] = nil end
        print(scriptName .. ": db_api cache cleared")
    end,
    print = function(maxLen)
        local HARD_LIMIT = 500
        local limit = tonumber(maxLen) or HARD_LIMIT
        if limit < 1 then limit = 1 end
        if limit > HARD_LIMIT then limit = HARD_LIMIT end

        if next(cache) == nil then
            print(("[^2%s^0] db_api cache summary: ^3entries^0=^20^0 ^3jsonLen^0=^22B^0 ^3printedLen^0=^22B^0 ^3limit^0=^2%dB^0")
                :format(
                    scriptName,
                    limit
                ))
            print(("[^2%s^0] db_api cache: {}"):format(scriptName))
            return true
        end
        local snapshot = {}
        local entries = 0
        for k, v in pairs(cache) do
            snapshot[k] = v and v.data or nil
            entries = entries + 1
        end
        local encode = json and json.encode
        local ok, encodedOrErr = false, nil
        local encoded = nil
        -- Prefer pretty output (newlines/indent) if supported by this json lib
        if encode then
            ok, encodedOrErr = pcall(encode, snapshot, { indent = true })
            if not ok then
                ok, encodedOrErr = pcall(encode, snapshot, true)
            end
            if not ok then
                ok, encodedOrErr = pcall(encode, snapshot)
            end
        end
        encoded = ok and encodedOrErr or ("<encode_error:%s>"):format(tostring(encodedOrErr))

        encoded = tostring(encoded)
        local fullLen = #encoded
        if #encoded > limit then
            encoded = encoded:sub(1, limit) .. "...(truncated)"
        end
        local printedLen = #encoded
        print(("[^2%s^0]summary: ^3entries^0=^2%d^0 ^3fullLen^0=^2%dB^0(^2%.2fKB^0) ^3printedLen^0=^2%dB^0 ^3limit^0=^2%dB^0")
            :format(
                scriptName,
                entries,
                fullLen,
                fullLen / 1024,
                printedLen,
                limit
            ))
        print(("[^2%s^0] db_api cache: %s"):format(scriptName, encoded))
        return true
    end,
    printFull = function()
        if next(cache) == nil then
            print(("[^2%s^0] db_api cache summary(full): ^3entries^0=^20^0 ^3jsonLen^0=^22B^0 ^3printedLen^0=^22B^0")
                :format(scriptName))
            print(("[^2%s^0] db_api cache(full): {}"):format(scriptName))
            return true
        end
        local entries = 0
        for k, v in pairs(cache) do
            entries = entries + 1
        end
        local encode = json and json.encode
        local ok, encodedOrErr = false, nil
        local encoded = nil
        if encode then
            ok, encodedOrErr = pcall(encode, cache)
            if not ok then
                ok, encodedOrErr = pcall(encode, cache, true)
            end
            if not ok then
                ok, encodedOrErr = pcall(encode, cache)
            end
        end
        encoded = ok and encodedOrErr or ("<encode_error:%s>"):format(tostring(encodedOrErr))
        encoded = tostring(encoded)
        local fullLen = #encoded

        print("---------------------------------------")
        print(encoded)
        print("---------------------------------------")
        print(("[^2%s^0] db_api cache (full): ^3entries^0=^2%d^0 ^3jsonLen^0=^2%dB^0(^2%.2fKB^0) ^3printedLen^0=^2%dB^0")
            :format(
                scriptName,
                entries,
                fullLen,
                fullLen / 1024,
                fullLen
            ))
        return true
    end,
    invalidate = function(id)
        local cacheKey = generateCacheKey(id)
        if not cacheKey then return end
        cache[cacheKey] = nil
    end,
    get = function(id, cb)
        local cacheKey = generateCacheKey(id)
        if not cacheKey then return false end
        if cache[cacheKey] then
            if cb then cb(cache[cacheKey].data) end
            -- print("GetFromCache!")
            return true
        end
        return false
    end,
    set = function(id, data)
        local cacheKey = generateCacheKey(id)
        if not cacheKey then return end
        if not data then return end
        cache[cacheKey] = { data = data }
    end,
    -- pass function in, and can do conditional check before update in there
    update = function(id, updateFunction)
        local cacheKey = generateCacheKey(id)
        if not cacheKey then return false end
        local currentData = cache[cacheKey] and cache[cacheKey].data or nil
        local updatedData = updateFunction(currentData)
        if updatedData == nil then
            cache[cacheKey] = nil -- allow updateFunction to delete cached entry
            return true
        end
        if updatedData then
            cache[cacheKey] = { data = updatedData }
            return true
        end
        return false
    end
}

--========================================
-- COMMANDS ที่ต้องมีติดไว้
--========================================
RegisterCommand(scriptName .. ":clearCache", function(source, args, rawCommand)
    if source ~= 0 then return print("only console can use this command") end
    db.cache.clear()
end, true)

RegisterCommand(scriptName .. ":printCache", function(source, args, rawCommand)
    if source ~= 0 then return print("only console can use this command") end
    local limit = args and args[1] or nil
    db.cache.print(limit) -- defaults to 500 inside if nil/invalid
end, true)

RegisterCommand(scriptName .. ":printCacheFull", function(source, args, rawCommand)
    -- พิมพ์ทั้งหมดที่มีเลย ถ้าข้อมูลใหญ่มากๆ อย่าใช้บ่อย
    if source ~= 0 then return print("only console can use this command") end
    db.cache.printFull()
end, true)
--========================================

function db.getTestByID(id, cb)
    if not id or id == "" then
        logError("db.getTestByID", "invalid id (nil/empty)")
        if cb then cb(nil) end
        return
    end
    if db.cache.get(id, cb) then return end
    MySQL.single("SELECT * FROM oa_test WHERE test_id = ?", { id }, function(row)
        db.cache.set(id, row) -- cache single row (or nil)
        if cb then cb(row) end
    end)
end

function db.insertTestData(data, message, cb)
    if data == nil or message == nil then
        logError("db.insertTestData", ("invalid args data=%s message=%s"):format(tostring(data), tostring(message)))
        if cb then cb(nil) end
        return
    end
    MySQL.insert("INSERT INTO oa_test (data, message) VALUES (?, ?)", { data, message }, function(insertId)
        if cb then cb(insertId) end
    end)
end

function db.updateTestMessage(id, message, cb)
    if not id or id == "" then
        logError("db.updateTestMessage", "invalid id (nil/empty)")
        if cb then cb(0) end
        return
    end
    MySQL.update("UPDATE oa_test SET message = ? WHERE test_id = ?", { message, id }, function(affected)
        db.cache.update(id, function(currentData)
            if not currentData then return nil end
            currentData.message = message
            return currentData
        end)
        if cb then cb(affected) end
    end)
end

function db.deleteTestId(id, cb)
    if not id or id == "" then
        logError("db.deleteTestId", "invalid id (nil/empty)")
        if cb then cb(0) end
        return
    end
    MySQL.update("DELETE FROM oa_test WHERE test_id = ?", { id }, function(affected)
        db.cache.invalidate(id)
        if cb then cb(affected) end
    end)
end
