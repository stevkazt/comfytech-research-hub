// autoPromptGenerator.js

const productToPrompt = (product) => {
    // Helper to join image URLs or summarize image count
    const images = product.images && product.images.length
        ? product.images.map((img, i) => `    ${i + 1}. ${img}`).join('\n')
        : 'No images found.';

    // Summarize competitor findings
    const findings = product.findings && product.findings.length
        ? product.findings.map((f, i) =>
            `- Example #${i + 1}:
  - Store: ${f.store}
  - Platform: ${f.listingType}
  - Price: ${f.price}
  - Stock: ${f.stock}
  - Variant: ${f.variant}
  - Delivery: ${f.deliveryTime}, ${f.shippingCost}
  - Seller Type: ${f.sellerType}, ${f.origin}
  - Rating: ${f.rating}
  - Review Count: ${f.review_count}
  - Image Quality/Match: ${f.imageQuality}, ${f.imageMatch}
  - Notes: ${f.notes || "None"}`
        ).join('\n\n')
        : "No competitor findings yet.";

    // Summarize trend validation
    const trends = product.trendValidation && product.trendValidation.length
        ? product.trendValidation.map((t, i) =>
            `- ${t.trendSource}:
    Trend: ${t.trendStatus}
    Research Link: ${t.researchLink}
    Notes: ${t.trendNotes || "None"}`
        ).join('\n')
        : "No trend validation yet.";

    // Main variants/colors
    const colorsAttr = product.attributes && product.attributes.find(attr => attr.description === "COLOR");
    const mainColors = colorsAttr && colorsAttr.values
        ? colorsAttr.values.map(v => v.value).join(', ')
        : "N/A";

    // Product description, trimmed and plain
    const stripHtml = (html) => html
        ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        : '';

    // Compose the prompt
    return `
Here’s a complete summary of my research on a dropshipping product. Please analyze and provide actionable advice on:

- Is this product worth selling now?
- What are its main risks or opportunities?
- Any gaps in my research?
- What next steps would you recommend?

---

### PRODUCT SUMMARY

- **Name:** ${product.name}
- **Dropi Price:** ${product.price} COP
- **Category:** ${product.categories}
- **Status:** ${product.status}
- **Short Description:**  
  ${stripHtml(product.description_html).slice(0, 350)}...
- **Main Variants/Colors:** ${mainColors}
- **Images:**  
${images}

---

### COMPETITOR FINDINGS

${findings}

---

### TREND VALIDATION

${trends}

---

### MY OWN NOTES

[Add your own notes, margin observations, feedback, concerns, etc.]

---

### QUESTIONS/WHAT I NEED

[What do you want me (the assistant) to focus on? E.g., “Is the market too saturated?” “Are my margins enough?” “Should I test with ads?”]

---

Please analyze the above and provide a focused action plan for this product.
  `.trim();
};


// Export for use in other scripts
module.exports = productToPrompt;