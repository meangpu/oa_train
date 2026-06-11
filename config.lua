Config = {}
local minute = 60 * 1000

Config.BlipIcon = GetHashKey("blip_ambient_train")

Config.Location = {
    ["ARMADILO"] = {
        npcLocation = vector4(-3729.156, -2601.321, -12.888, 180.806),
        exitLocation = vector4(-3740.613, -2607.416, -13.184, 91.332),
        label = "Armadilo Train Station"
    },
    ["BLACKWATER"] = {
        npcLocation = vector4(-873.513, -1332.754, 44.011, 270.809),
        exitLocation = vector4(-866.153, -1332.853, 43.425, 267.751),
        label = "Blackwater Train Station"
    },
    ["VALENTINE"] = {
        npcLocation = vector4(-175.371, 631.853, 114.140, 324.162),
        exitLocation = vector4(-165.587, 631.442, 114.082, 236.152),
        label = "Valentine Train Station"
    },
    ["RHODES"] = {
        npcLocation = vector4(1230.161, -1298.506, 76.954, 226.338),
        exitLocation = vector4(1230.326, -1306.115, 76.956, 136.125),
        label = "Rhodes Train Station"
    },
    ["SAINT_DENIS"] = {
        npcLocation = vector4(2747.902, -1396.479, 46.233, 29.842),
        exitLocation = vector4(2746.083, -1403.451, 46.243, 202.676),
        label = "Saint Denis Train Station"
    },
    ["BACCHUS_STATION"] = {
        npcLocation = vector4(582.725, 1681.029, 187.839, 317.242),
        exitLocation = vector4(584.914, 1684.099, 187.720, 314.859),
        label = "Bacchus Train Station"
    },
    ["ANNESBURG"] = {
        npcLocation = vector4(2933.111, 1282.543, 44.703, 77.108),
        exitLocation = vector4(2944.753, 1282.118, 44.676, 248.123),
        label = "Annesburg Train Station"
    }
}

Config.WaitTime = {
    default = 60 * minute,
    vip_small = 45 * minute,
    vip_medium = 30 * minute,
    vip_large = 15 * minute,
}
