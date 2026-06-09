Config = {}
Config.DebugPrintClient = true
Config.DebugPrintServer = true

local minute = 60 * 1000

Config.Location = {
    ["ARMADILO"] = {
        npcLocation = vector4(-3729.075, -2601.290, -12.888, 172.615)
    },
    ["RHODES"] = {
        npcLocation = vector4(1230.248, -1298.516, 76.954, 221.872)
    },
    ["SAINT"] = {
        npcLocation = vector4(2674.400, -1459.525, 46.341, 110.163)
        -- อันนี้ยังไม่เสร็จ
    },
}

Config.WaitTime = {
    default = 60 * minute,
    vip_small = 45 * minute,
    vip_medium = 30 * minute,
    vip_large = 15 * minute,
}
