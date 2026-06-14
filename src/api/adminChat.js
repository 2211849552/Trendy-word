import { apiRequest } from './client.js'
import { extractOrderList, getOrders } from './adminOrders.js'

// [17] نظام المحادثات — api.md
// GET    /api/orders/chat
// POST   /api/orders/chat/support       ← بدء/استئناف محادثة الإدارة ↔ السائق
// GET    /api/orders/chat/{id}/messages   ← {id} = معرّف المحادثة (conversation id)
// POST   /api/orders/chat/{id}/messages   ← body: { message_text: "..." }

const CHAT_BASE = '/api/orders/chat'

/** GET /api/orders/chat — قائمة المحادثات */
export function getChats(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`${CHAT_BASE}${query ? `?${query}` : ''}`)
}

/** POST /api/orders/chat/support — بدء أو استئناف محادثة الإدارة العليا مع سائق */
export function startSupportChat(driverId) {
  const id = Number(driverId)
  if (!Number.isFinite(id) || id <= 0) {
    return Promise.reject(Object.assign(new Error('معرّف السائق غير صالح.'), { status: 422 }))
  }
  return apiRequest(`${CHAT_BASE}/support`, {
    method: 'POST',
    body: JSON.stringify({ driver_id: id }),
  })
}

/** GET /api/orders/chat/{id}/messages — رسائل محادثة طلب */
export function getChatMessages(chatId) {
  const id = Number(chatId)
  if (!Number.isFinite(id) || id <= 0) {
    return Promise.reject(Object.assign(new Error('معرّف المحادثة غير صالح.'), { status: 422 }))
  }
  return apiRequest(`${CHAT_BASE}/${id}/messages`)
}

/** POST /api/orders/chat/{id}/messages — إرسال رسالة */
export function sendChatMessage(chatId, message) {
  const id = Number(chatId)
  const text = String(message ?? '').trim()
  if (!Number.isFinite(id) || id <= 0) {
    return Promise.reject(Object.assign(new Error('معرّف المحادثة غير صالح.'), { status: 422 }))
  }
  if (!text) {
    return Promise.reject(Object.assign(new Error('نص الرسالة مطلوب.'), { status: 422 }))
  }
  return apiRequest(`${CHAT_BASE}/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message_text: text }),
  })
}

export function extractChatList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.chats)) return data.chats
  return []
}

export function extractMessageList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.messages)) return data.messages
  return []
}

function readDriverIdFromChat(chat) {
  const participants = Array.isArray(chat?.participants) ? chat.participants : []
  const participantId = participants.find((p) => p?.id != null)?.id ?? null

  return (
    chat?.driver_id ??
    chat?.driverId ??
    chat?.driver?.id ??
    chat?.context?.driver_id ??
    chat?.last_message?.sender?.id ??
    participantId ??
    chat?.participant?.id ??
    chat?.other_party?.id ??
    chat?.other_party_id ??
    chat?.user_id ??
    chat?.user?.id ??
    null
  )
}

function isDriverSupportChat(chat) {
  const type = String(chat?.type ?? chat?.chat_type ?? '').toLowerCase()
  return type.includes('driver') || type.includes('support')
}

function readOrderIdFromRecord(record) {
  const raw = record?.raw ?? record
  return (
    record?.orderId ??
    record?.order_id ??
    raw?.order_id ??
    raw?.id ??
    record?.id ??
    null
  )
}

function readOrderDriverId(order) {
  return (
    order?.driver_id ??
    order?.driverId ??
    order?.driver?.id ??
    order?.assigned_driver_id ??
    order?.delivery_driver_id ??
    null
  )
}

/** البحث عن محادثة السائق في قائمة المحادثات */
export function findDriverChat(chats, driverId) {
  const id = Number(driverId)
  if (!id) return null
  return chats.find((chat) => Number(readDriverIdFromChat(chat)) === id) ?? null
}

/** معرّف المحادثة — يُستخدم في مسارات الرسائل (conversation id) */
export function resolveChatId(chat, fallbackId = null) {
  const raw = chat?.raw ?? chat
  const candidates = [
    raw?.conversation_id,
    chat?.conversationId,
    raw?.id,
    chat?.id,
    chat?.chat_id,
    raw?.data?.id,
    fallbackId,
    raw?.order_id,
    raw?.order?.id,
    chat?.orderId,
    chat?.order_id,
  ]

  for (const value of candidates) {
    const id = Number(value)
    if (Number.isFinite(id) && id > 0) return id
  }
  return null
}

function formatMessageTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('ar-LY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function mapChat(item) {
  return {
    id: item.id ?? item.chat_id ?? item.order_id,
    orderId: item.order_id ?? item.order?.id ?? item.id,
    driverId: readDriverIdFromChat(item),
    driverName:
      item.driver_name ??
      item.driver?.name ??
      item.participant?.name ??
      item.other_party?.name ??
      item.user?.name ??
      '—',
    lastMessage:
      item.last_message ??
      item.last_message_text ??
      item.last_message_body ??
      item.latest_message?.message_text ??
      item.latest_message?.body ??
      item.latest_message?.message ??
      '',
    updatedAt: item.updated_at ?? item.last_message_at ?? item.created_at ?? null,
    raw: item,
  }
}

export function mapMessage(item, currentUserId = null) {
  const senderId =
    item.sender_id ??
    item.sender?.id ??
    item.user_id ??
    item.from_id ??
    item.author_id ??
    null
  const senderRole = String(
    item.sender_role ??
    item.sender_type ??
    item.sender?.role ??
    item.role ??
    item.from_role ??
    '',
  ).toLowerCase()

  const isMine =
    item.is_mine === true ||
    item.is_own === true ||
    item.mine === true ||
    senderRole.includes('admin') ||
    senderRole.includes('super') ||
    senderRole.includes('operations') ||
    senderRole.includes('stores_admin') ||
    (currentUserId != null && senderId != null && Number(senderId) === Number(currentUserId))

  return {
    id: item.id ?? `${item.created_at}-${senderId}`,
    body:
      item.message_text ??
      item.message ??
      item.body ??
      item.content ??
      item.text ??
      '',
    senderId,
    senderName: item.sender_name ?? item.sender?.name ?? item.user?.name ?? '—',
    senderRole,
    isMine,
    createdAt: item.created_at ?? item.sent_at ?? item.timestamp ?? null,
    timeLabel: formatMessageTime(item.created_at ?? item.sent_at ?? item.timestamp),
    raw: item,
  }
}

async function findLatestOrderIdForDriver(driverId) {
  const id = Number(driverId)
  if (!id) return null

  const pickLatest = (orders) => {
    const matched = orders.filter((order) => Number(readOrderDriverId(order)) === id)
    if (!matched.length) return null
    matched.sort((a, b) => {
      const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
      const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
      return bTime - aTime
    })
    return readOrderIdFromRecord(matched[0])
  }

  try {
    const filtered = await getOrders({ driver_id: id, per_page: 50 })
    const fromFilter = pickLatest(extractOrderList(filtered))
    if (fromFilter) return Number(fromFilter)
  } catch {
    // بعض الخوادم لا تدعم driver_id كفلتر
  }

  const data = await getOrders({ per_page: 100 })
  const fromList = pickLatest(extractOrderList(data))
  return fromList ? Number(fromList) : null
}

function extractSupportChatId(data) {
  const payload = data?.data ?? data
  return resolveChatId(payload, null)
}

/** تحميل سياق محادثة الإدارة العليا مع سائق — POST /api/orders/chat/support */
export async function loadDriverChatContext(driverId) {
  const id = Number(driverId)
  let chat = null
  let chatId = null

  try {
    const data = await getChats({ driver_id: id, type: 'driver_support' })
    const chats = extractChatList(data)
      .filter(isDriverSupportChat)
      .map(mapChat)
    chat = findDriverChat(chats, id)
    chatId = resolveChatId(chat, null)
  } catch {
    // قائمة المحادثات اختيارية — نعتمد على startSupportChat
  }

  if (!chatId) {
    const started = await startSupportChat(id)
    chat = mapChat(started?.data ?? started)
    chatId = extractSupportChatId(started)
  }

  if (!chatId) {
    chatId = await findLatestOrderIdForDriver(id)
  }

  if (!chatId) {
    const err = new Error('NO_CHAT_ORDER')
    err.code = 'NO_CHAT_ORDER'
    throw err
  }

  return { chat, chatId }
}
