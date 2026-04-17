const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75

function xpRange(level, multiplier = global.multiplier || 2) {
  level = Math.floor(level)
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  const max = Math.round(Math.pow(level + 1, growth) * multiplier)
  return { min, max, xp: max - min }
}

function findLevel(xp, multiplier = global.multiplier || 2) {
  if (xp <= 0) return -1
  let level = 0
  do { level++ } while (xpRange(level, multiplier).min <= xp)
  return --level
}

function canLevelUp(level, xp, multiplier = global.multiplier || 2) {
  return level < findLevel(xp, multiplier)
}

// 🔥 HACERLAS GLOBALES
global.xpRange = xpRange
global.canLevelUp = canLevelUp

// 🔥 FUNCIÓN GLOBAL PARA XP
global.addXP = function (user, amount) {
  user.exp = (user.exp || 0) + amount
  user.level = user.level || 0

  let before = user.level

  while (canLevelUp(user.level, user.exp, global.multiplier)) {
    user.level++
  }

  const { min, max } = xpRange(user.level, global.multiplier)
  user.minxp = min
  user.maxxp = max

  return {
    before,
    after: user.level
  }
}

// 🚀 TU CÓDIGO ORIGINAL
export default async (m) => {
  const user = global.db.data.users[m.sender]
  const users = global.db.data.chats[m.chat].users[m.sender]

  let before = user.level

  while (canLevelUp(user.level, user.exp, global.multiplier)) {
    user.level++
  }

  if (before !== user.level) {
    const coinBonus = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000
    const expBonus = Math.floor(Math.random() * (500 - 100 + 1)) + 100

    if (user.level % 5 === 0) {
      users.coins = (users.coins || 0) + coinBonus
      user.exp = (user.exp || 0) + expBonus
    }

    const { min, max } = xpRange(user.level, global.multiplier)
    user.minxp = min
    user.maxxp = max
  }
}