Config = {}
local minute = 60 * 1000

Config.Location = {
    ["ARMADILO"] = {
        npcLocation = vector4(-3729.075, -2601.290, -12.888, 172.615),
        exitLocation = vector4(0, 0, 0, 0)
    },
    ["RHODES"] = {
        npcLocation = vector4(1230.248, -1298.516, 76.954, 221.872),
        exitLocation = vector4(0, 0, 0, 0)
    },
}

Config.WaitTime = {
    default = 60 * minute,
    vip_small = 45 * minute,
    vip_medium = 30 * minute,
    vip_large = 15 * minute,
}
