/**
 * Chatbot Rating API
 * POST /api/chatbot/rate - Rate a conversation
 */

/**
 * POST /api/chatbot/rate - Submit conversation rating
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();

    if (!data.conversationId && !data.conversation_id) {
      return new Response(JSON.stringify({ success: false, error: "conversation_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (data.rating === undefined) {
      return new Response(JSON.stringify({ success: false, error: "rating is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const conversationId = data.conversationId || data.conversation_id;
    const rating = parseInt(data.rating);

    // Validate rating (1-5)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ success: false, error: "rating must be between 1 and 5" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();

    // Update conversation with rating
    await env.DB.prepare(`
      UPDATE chatbot_conversations 
      SET rating = ?, rating_feedback = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      rating,
      data.feedback || data.ratingFeedback || null,
      now,
      conversationId
    ).run();

    // Update daily analytics
    const today = new Date().toISOString().split('T')[0];
    await env.DB.prepare(`
      INSERT INTO chatbot_analytics (id, date, ratings_count, ratings_sum, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET 
        ratings_count = ratings_count + 1,
        ratings_sum = ratings_sum + ?,
        avg_rating = CAST(ratings_sum + ? AS REAL) / (ratings_count + 1),
        updated_at = ?
    `).bind(
      `analytics_${today}`, today, rating, now, now,
      rating, rating, now
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: "Thank you for your feedback!"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
