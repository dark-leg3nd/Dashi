import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['addcoin', 'addcoins', 'añadircoin'],
  category: 'owner',
  isOwner: true,

  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data || {}
    const chatId = m.chat
    const chatData = db.chats?.[chatId]

    if (!chatData?.users) {
      return m.reply('🍒 El sistema RPG no está activo en este chat.')
    }

    // ───── USUARIO DESTINO ─────
    const mentioned = m.mentionedJid || []
    const who2 = mentioned.length
      ? mentioned[0]
      : (m.quoted ? m.quoted.sender : null)

    if (!who2) {
      return m.reply(`🍒 Menciona o responde a un usuario.\n\nEjemplo:\n${usedPrefix + command} @user 1000`)
    }

    const who = await resolveLidToRealJid(who2, client, chatId)

    if (!chatData.users[who]) {
      return m.reply('🍒 El usuario no está registrado en el RPG.')
    }

    // ───── CANTIDAD ─────
    const amount = Number(args[0])

    if (!Number.isInteger(amount)) {
      return m.reply('🍒 Ingresa un número entero válido.')
    }

    if (amount <= 0) {
      return m.reply('🍒 La cantidad debe ser mayor a 0.')
    }

    // ───── AÑADIR COINS ─────
    chatData.users[who].coins =
      (chatData.users[who].coins || 0) + amount

    await client.sendMessage(
      m.chat,
      {
        text: `💸 *Coins añadidos*\n\n➕ ${amount.toLocaleString()}\n👤 @${who.split('@')[0]}`,
        mentions: [who]
      },
      { quoted: m }
    )
  }
}