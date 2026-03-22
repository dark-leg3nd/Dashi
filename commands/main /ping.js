export default {
  command: ["ping", "p"],
  category: "info",

  run: async (client, m) => {
    const start = Date.now()

    const tempMsg = await client.sendMessage(
      m.key.remoteJid,
      { text: "✦ Calculando ping..." },
      { quoted: m }
    )

    const latency = Date.now() - start

    await client.sendMessage(
      m.key.remoteJid,
      {
        text: `✰ Pong\n> Pong ${latency}ms`,
        edit: tempMsg.key
      },
      { quoted: m }
    )
  }
}