export default async function handler(req, res) {
  const { date, number } = req.body;
  
  // VercelのSettingsで設定した名前がこれと一致している必要があります
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ text: "APIキーが設定されていません。VercelのSettingsを確認してください。" });
  }

  try {
    const textPrompt = `あなたは占い師です。日時(${date}), 数字(${number})に基づき、今日の運勢を日本語で150文字程度で占ってください。最後は希望のある言葉で締めてください。`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: textPrompt }] }] })
    });
    
    const data = await response.json();

    // APIからの返答がエラーだった場合の処理を追加
    if (data.error) {
      return res.status(500).json({ text: "Gemini APIエラー: " + data.error.message });
    }

    const fortuneText = data.candidates[0].content.parts[0].text;
    const imageSeed = number || Math.random();
    const imageUrl = `https://pollinations.ai/p/abstract_spiritual_energy_ghibli_style?width=1024&height=1024&seed=${imageSeed}`;

    res.status(200).json({ text: fortuneText, imageUrl: imageUrl });
  } catch (error) {
    res.status(500).json({ text: "通信エラーが発生しました: " + error.message });
  }
}
