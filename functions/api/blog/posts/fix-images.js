/**
 * POST /api/blog/posts/fix-images
 * Fix posts that have broken local image URLs by assigning cloud R2 URLs from media library
 */

export async function onRequestPost(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get all posts with broken image URLs (local paths or empty)
    const postsResult = await env.DB.prepare(`
      SELECT id, title, image_url FROM blog_posts 
      WHERE image_url IS NULL 
         OR image_url = '' 
         OR image_url LIKE 'images/%'
         OR image_url LIKE '/images/%'
         OR image_url = '[object Object]'
    `).all();

    const postsToFix = postsResult.results || [];
    
    if (postsToFix.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No posts with broken images found",
        fixed: 0
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get available cloud images from media library
    const mediaResult = await env.DB.prepare(`
      SELECT id, r2_url, filename FROM media_library 
      WHERE mime_type LIKE 'image/%' 
        AND r2_url IS NOT NULL 
        AND r2_url != ''
        AND r2_url NOT LIKE 'data:%'
      LIMIT 50
    `).all();

    const cloudImages = mediaResult.results || [];

    if (cloudImages.length === 0) {
      return new Response(JSON.stringify({ 
        error: "No cloud images available in media library",
        postsNeedingFix: postsToFix.length
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fix each post with a random cloud image
    const fixedPosts = [];
    for (const post of postsToFix) {
      const randomImage = cloudImages[Math.floor(Math.random() * cloudImages.length)];
      
      await env.DB.prepare(`
        UPDATE blog_posts SET image_url = ?, updated_at = ? WHERE id = ?
      `).bind(randomImage.r2_url, Date.now(), post.id).run();

      fixedPosts.push({
        id: post.id,
        title: post.title,
        oldImageUrl: post.image_url,
        newImageUrl: randomImage.r2_url
      });
    }

    return new Response(JSON.stringify({
      message: `Fixed ${fixedPosts.length} posts with cloud images`,
      fixed: fixedPosts.length,
      posts: fixedPosts
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
