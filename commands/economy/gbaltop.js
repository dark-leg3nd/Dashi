export default {
  command: ['gbaltop'],
  category: 'rpg',

  run: async (client, m, args, usedPrefix, command) => {

    const db = global.db.data || {}
    const chats = db.chats || {}
    const usersDb = db.users || {}

    const botId = client.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings?.[botId] || {}
    const monedas = botSettings.currency || "Coins"

    if (!Object.keys(chats).length) {
      return m.reply("No hay datos.")
    }

    const globalMap = {}

    // ───── RECORRER GRUPOS ─────
    for (const chatId in chats) {
      const chat = chats[chatId]
      if (!chat?.users) continue

      for (const jid in chat.users) {
        const user = chat.users[jid]

        const total = (user?.coins || 0) + (user?.bank || 0)

        if (!globalMap[jid] || total > globalMap[jid].total) {
          globalMap[jid] = { total }
        }
      }
    }

    let users = Object.entries(globalMap)
      .map(([jid, data]) => ({
        jid,
        name: usersDb?.[jid]?.name || jid.split('@')[0],
        total: data.total || 0
      }))
      .filter(u => u.total > 0)

    if (!users.length) {
      return m.reply(`ꕥ No hay usuarios con ${monedas}.`)
    }

    // ───── ORDENAR ─────
    users.sort((a, b) => b.total - a.total)

    const pageSize = 10
    let page = parseInt(args[0])
    if (isNaN(page) || page < 1) page = 1

    const totalPages = Math.ceil(users.length / pageSize) || 1
    if (page > totalPages) page = totalPages

    const start = (page - 1) * pageSize
    const pageUsers = users.slice(start, start + pageSize)

    let textMsg = `🌍「✿」Top Global de *${monedas}* (Sin sumar grupos)\n\n`

    for (let i = 0; i < pageUsers.length; i++) {
      const user = pageUsers[i]
      const position = start + i + 1

      textMsg += `✰ ${position} » *${user.name}:*\n`
      textMsg += `\t\t Total→ *¥${user.total.toLocaleString()} ${monedas}*\n`
    }

    textMsg += `\n> • Página *${page}* de *${totalPages}*`

    if (page < totalPages) {
      textMsg += `\n> • Siguiente: *${usedPrefix + command} ${page + 1}*`
    }

    if (page > 1) {
      textMsg += `\n> • Anterior: *${usedPrefix + command} ${page - 1}*`
    }

    return m.reply(textMsg)
  }
}