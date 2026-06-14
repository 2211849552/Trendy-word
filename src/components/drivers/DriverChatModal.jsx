import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, MessageCircle, Send, X } from 'lucide-react'
import {
  extractMessageList,
  getChatMessages,
  loadDriverChatContext,
  mapMessage,
  sendChatMessage,
} from '../../api/adminChat.js'
import { PrimaryButton } from '../PrimaryButton.jsx'

function apiErrorMessage(err, fallback) {
  if (err?.code === 'NO_CHAT_ORDER' || err?.message === 'NO_CHAT_ORDER') {
    return 'تعذّر فتح محادثة مع هذا السائق. حاولي مرة أخرى.'
  }
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية التواصل مع السائقين.'
  if (err?.status === 422) {
    const msg = err.message || fallback
    if (msg.includes('message text')) return 'نص الرسالة مطلوب.'
    return msg
  }
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  const msg = err?.message || fallback
  if (msg.includes('OrderController::show')) {
    return 'تعذّر تحميل المحادثة. تأكّدي من وجود طلبية مرتبطة بالسائق.'
  }
  return msg
}

export function DriverChatModal({ driver, open, onClose }) {
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = useCallback(async (id, silent = false) => {
    if (!id) return
    if (!silent) setLoading(true)
    setError('')
    try {
      const data = await getChatMessages(id)
      setMessages(extractMessageList(data).map((item) => mapMessage(item)))
    } catch (err) {
      if (!silent) {
        setMessages([])
        setError(apiErrorMessage(err, 'تعذّر تحميل الرسائل.'))
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  const bootstrapChat = useCallback(async () => {
    if (!driver?.id) return
    setLoading(true)
    setError('')
    setMessages([])
    setDraft('')
    try {
      const { chatId: resolvedId } = await loadDriverChatContext(driver.id)
      setChatId(resolvedId)
      await loadMessages(resolvedId, true)
    } catch (err) {
      setChatId(null)
      setError(apiErrorMessage(err, 'تعذّر فتح المحادثة مع السائق.'))
    } finally {
      setLoading(false)
    }
  }, [driver, loadMessages])

  useEffect(() => {
    if (!open || !driver) return undefined
    bootstrapChat()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [open, driver, bootstrapChat])

  useEffect(() => {
    if (!open || !chatId) return undefined
    pollRef.current = setInterval(() => {
      loadMessages(chatId, true)
    }, 8000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [open, chatId, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape' && !sending) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, sending])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !chatId || sending) return

    setSending(true)
    setError('')
    try {
      await sendChatMessage(chatId, text)
      setDraft('')
      await loadMessages(chatId, true)
    } catch (err) {
      setError(apiErrorMessage(err, 'تعذّر إرسال الرسالة.'))
    } finally {
      setSending(false)
    }
  }

  if (!open || !driver) return null

  const overlay = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => !sending && onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-chat-title"
        className="relative flex h-[min(640px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-brand-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-500">
              <MessageCircle className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 text-right">
              <h2 id="driver-chat-title" className="truncate text-lg font-bold text-white">
                محادثة مع {driver.name}
              </h2>
              <p className="truncate text-xs text-white/55" dir="ltr">
                {driver.phone}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !sending && onClose?.()}
            className="rounded-lg p-2 text-white/60 hover:bg-brand-300 hover:text-white/90 disabled:opacity-50"
            aria-label="إغلاق"
            disabled={sending}
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-brand-300/30 px-4 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-white/60">
              <Loader2 className="size-5 animate-spin" />
              جاري تحميل المحادثة...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <MessageCircle className="size-10 text-white/25" />
              <p className="text-sm font-medium text-white/70">لا توجد رسائل بعد</p>
              <p className="text-xs text-white/50">
                ابدئي المحادثة مع السائق — ستصل الرسالة عبر نظام الشات الموحّد.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  className={`flex ${msg.isMine ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.isMine
                        ? 'rounded-br-md bg-gradient-to-r from-[#b533ff] to-[#4285f4] text-white'
                        : 'rounded-bl-md border border-white/10 bg-brand-200 text-white'
                    }`}
                  >
                    {!msg.isMine ? (
                      <p className="mb-1 text-[11px] font-bold text-white/50">{msg.senderName}</p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                    {msg.timeLabel ? (
                      <p className={`mt-1 text-[10px] ${msg.isMine ? 'text-white/70' : 'text-white/45'}`}>
                        {msg.timeLabel}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
              <li ref={messagesEndRef} aria-hidden />
            </ul>
          )}
        </div>

        {error ? (
          <p className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleSend}
          className="flex shrink-0 items-end gap-2 border-t border-white/5 bg-brand-200 p-4"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتبي رسالتك للسائق..."
            rows={2}
            disabled={sending || loading || !chatId}
            className="input-brand min-h-[44px] flex-1 resize-none disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
          />
          <PrimaryButton
            type="submit"
            disabled={sending || loading || !draft.trim() || !chatId}
            className="shrink-0 px-4"
            aria-label="إرسال"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </PrimaryButton>
        </form>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
