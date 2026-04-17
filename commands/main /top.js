export default {
  command: ['top'],
  category: 'rpg',

  run: async (client, m, args, usedPrefix, command) => {
    const users = global.db.data.users || {}
    const pageSize = 10

    let page = parseInt(args[0])
    if (isNaN(page) || page < 1) page = 1

    // ───── ORDENAR POR XP ─────
    let sorted = Object.entries(users)
      .filter(([id, data]) => data && typeof data.exp === 'number')
      .sort((a, b) => (b[1].exp || 0) - (a[1].exp || 0))

    const totalUsers = sorted.length
    const totalPages = Math.ceil(totalUsers / pageSize) || 1

    if (page > totalPages) page = totalPages
    if (page < 1) page = 1

    const start = (page - 1) * pageSize
    const pageUsers = sorted.slice(start, start + pageSize)

    let text = `◢✿ Top de usuarios con más experiencia ✿◤\n`

    for (let i = 0; i < pageUsers.length; i++) {
      const [id, data] = pageUsers[i]

      const position = start + i + 1
      const name = data?.name || id.split('@')[0]
      const xp = data?.exp || 0
      const lvl = data?.level || 0

      text += `\n✰ ${position} » *${name}*`
      text += `\n\t\t❖ XP » *${xp}*  ❖ LVL » *${lvl}*\n`
    }

    text += `\n> • Página *${page}* de *${totalPages}*`

    if (page < totalPages) {
      text += `\n> • Siguiente página: *${usedPrefix + command} ${page + 1}*`
    }

    if (page > 1) {
      text += `\n> • Página anterior: *${usedPrefix + command} ${page - 1}*`
    }

    return m.reply(text)
  }
}