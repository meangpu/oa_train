discordLog = {}

local discordWebHook =
"https://discord.com/api/webhooks/1355563596486021292/K_6wBaD8erD5ox1r1M2ShEgKbf5A0ZYALSbskLj738jBUihNkn-P81pkGYqIwXX3DYsv"

function discordLog.log(message, do_by)
    local finishTimeString = os.date("%Y-%m-%d %I:%M%p", goldenTimeEnd)
    local webhookMessage = {
        username = "Oasis GoldenTime",
        -- content = "<@&1343800143312584746>",
        embeds = { {
            title = "GOLDENTIME Event Log",
            description = message,
            fields = {
                { name = "⌛ สิ้นสุด", value = finishTimeString, inline = true },
                { name = "👤 เริ่มโดย", value = do_by, inline = true },
            },
            -- color = 16776960,
            timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
        } }
    }
    PerformHttpRequest(discordWebHook, function(err, text, headers)
        if err < 200 or err >= 300 then
            print("Failed to send Discord log: " .. err)
        end
    end, 'POST', json.encode(webhookMessage), { ['Content-Type'] = 'application/json' })
end
