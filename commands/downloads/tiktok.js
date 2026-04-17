import fetch from 'node-fetch'

export default {
  command: ['tiktok', 'tt', 'tiktoks', 'tts'],
  category: 'downloader',

  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(" ")
    if (!text) {
      return m.reply('❀ Por favor, ingresa un término de búsqueda o un enlace de TikTok.')
    }

    const isUrl = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/i.test(text)

    try {
      await m.react('🕒')

      // ───── LINK DIRECTO ─────
      if (isUrl) {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`)
        const json = await res.json()

        const data = json?.data
        if (!data?.play) {
          return m.reply('ꕥ Enlace inválido o sin contenido descargable.')
        }

        const caption = createCaption(
          data.title,
          data.author,
          data.duration,
          data.created_at
        )

        // ───── IMÁGENES ─────
        if (data.type === 'image' && Array.isArray(data.images)) {

          const medias = data.images.map(img => ({
            type: 'image',
            data: { url: img },
            caption
          }))

          await client.sendAlbumMessage(m.chat, medias, { quoted: m })

          if (data.music) {
            await client.sendMessage(
              m.chat,
              {
                audio: { url: data.music },
                mimetype: 'audio/mp4',
                fileName: 'tiktok_audio.mp4'
              },
              { quoted: m }
            )
          }

        } else {
          // ───── VIDEO ─────
          await client.sendMessage(
            m.chat,
            { video: { url: data.play }, caption },
            { quoted: m }
          )
        }

      // ───── BÚSQUEDA ─────
      } else {
        const res = await fetch('https://tikwm.com/api/feed/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'current_language=en',
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/116 Mobile Safari/537.36'
          },
          body: new URLSearchParams({
            keywords: text,
            count: 8,
            cursor: 0,
            HD: 1
          })
        })

        const json = await res.json()
        const results = json?.data?.videos?.filter(v => v.play) || []

        if (!results.length) {
          return m.reply('ꕥ No se encontraron resultados.')
        }

        const medias = results.slice(0, 6).map(v => ({
          type: 'video',
          data: { url: v.play },
          caption: createSearchCaption(v)
        }))

        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }

      await m.react('✔️')

    } catch (e) {
      await m.react('✖️')
      m.reply(`⚠︎ Error al procesar TikTok.\n\n${e.message}`)
    }
  }
}

// ───── FUNCIONES ─────
function createCaption(title, author, duration, created_at = '') {
  return `❀ *Título ›* \`${title || 'No disponible'}\`
☕︎ *Autor ›* ${author?.nickname || author?.unique_id || 'No disponible'}
✧︎ *Duración ›* ${duration || 'No disponible'}s
${created_at ? `☁︎ *Creado ›* ${created_at}` : ''}
𝅘𝅥𝅮 *Música ›* ${author?.unique_id || 'Original'}`
}

function createSearchCaption(data) {
  return `❀ *${data.title || 'Sin título'}*
☕︎ Autor: ${data.author?.nickname || 'Desconocido'}
✧︎ Duración: ${data.duration || 'N/A'}s
𝅘𝅥𝅮 Música: ${data.music?.title || 'Original'}`
}