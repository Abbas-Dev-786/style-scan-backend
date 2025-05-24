function extractJsonFromApiResponse(response) {
  // Handle the specific case where AI returns JSON in markdown
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/g, // ```json ... ```
    /```\s*([\s\S]*?)\s*```/g, // ``` ... ```
    /`([^`]+)`/g, // `...` (inline code)
  ];

  for (const pattern of patterns) {
    const matches = [...response.matchAll(pattern)];
    for (const match of matches) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        continue;
      }
    }
  }

  throw new Error("No valid JSON found in markdown response");
}

module.exports = extractJsonFromApiResponse;
