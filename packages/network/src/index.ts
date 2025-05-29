import { z } from 'zod'
import { NetMessage } from 'schema'

export const MessageSchema = NetMessage

export type Message = z.infer<typeof MessageSchema>

export function validateMessage(msg: unknown): Message {
  return MessageSchema.parse(msg)
}
