fx_version 'cerulean'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
author 'meangpu'
lua54 'yes'

-- escrow_ignore {}
shared_script 'config.lua'
client_script 'client.lua'
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua'
}
files { 'html/***' }
ui_page('html/index.html')
