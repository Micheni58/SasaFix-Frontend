// src/api/messageService.js

import apiClient from "./apiClient";

// ─────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────

/**
 * Get all conversations for the currently logged-in user.
 *
 * The backend automatically de  termines whether the user
 * is a client, service provider, or admin.
 */
export async function getConversations() {
  const response = await apiClient.get("/conversations/");
  return response.data;
}

/**
 * Create a new conversation with a service provider.
 *
 * @param {number} providerId - ServiceProvider.id
 * @param {number|null} bookingId - Optional booking ID
 */
export async function createConversation(providerId, bookingId = null) {
  const response = await apiClient.post("/conversations/", {
    provider_id: providerId,
    booking_id: bookingId,
  });

  return response.data;
}

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

/**
 * Get all messages belonging to a conversation.
 *
 * Opening a conversation also causes the backend
 * to mark incoming messages as read.
 */
export async function getMessages(conversationId) {
  const response = await apiClient.get(
    `/conversations/${conversationId}/messages`,
  );

  return response.data;
}

/**
 * Send a message to a conversation.
 *
 * @param {number} conversationId
 * @param {string} content
 */
export async function sendMessage(conversationId, content) {
  const response = await apiClient.post(
    `/conversations/${conversationId}/messages`,
    {
      content,
    },
  );

  return response.data;
}

// ─────────────────────────────────────────────
// UNREAD COUNT
// ─────────────────────────────────────────────

/**
 * Get the total number of unread messages
 * for the currently logged-in user.
 */
export async function getUnreadMessageCount() {
  const response = await apiClient.get("/conversations/unread/count");
  return response.data;
}

// ─────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────

export default {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadMessageCount,
};
