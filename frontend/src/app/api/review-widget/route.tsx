export async function GET() {
  const scriptContent = `
    (function() {
      if (window.ReviewWidgetLoaded) return;
      window.ReviewWidgetLoaded = true;

      const container = document.getElementById("review-widget");
      if (!container) return;

      // Create a new div inside the Shopify page
      const widgetDiv = document.createElement("div");
      widgetDiv.innerHTML = "<p style='color: blue; font-size: 16px;'>This is from Next.js</p>";
      container.appendChild(widgetDiv);
    })();
  `;

  return new Response(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
    },
  });
}
