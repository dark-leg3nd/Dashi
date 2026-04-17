export default {
  command: ['addxp'],
  isOwner: true,

  run: async (client, m, args) => {
    let target

    if (m.quoted) {
      target = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid[0]) {
      target = m.mentionedJid[0]
    } else {
      return m.reply('⚠️ Responde o menciona a alguien.')
    }

    const user = global.db.data.users[target]
    if (!user) return m.reply('❌ Usuario no encontrado.')

    const amount = Number(args[0])
    if (isNaN(amount)) return m.reply('⚠️ Número inválido.')

    const result = global.addXP(user, amount)

    m.reply(`✨ XP agregado
👤 @${target.split('@')[0]}
📈 +${amount}
🎚 Nivel: ${result.before} → ${result.after}`, null, {
      mentions: [target]
    })
  }
}