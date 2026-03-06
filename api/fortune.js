export default async function handler(req, res) {
  const { date, number } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ text: "エラー：VercelのSettingsでAPIキーが設定されていません。" });
  }

  try {
    const textPrompt = `あなたは占い師です。日時(${date}), 数字(${number})に基づき、今日の運勢を日本語で占ってください。`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: textPrompt }] }] })
    });
    
    const data = await response.json();

    // ここでGeminiからのエラー内容を直接画面に出すようにしました
    if (data.error) {
      return res.status(200).json({ text: `Gemini APIエラー: ${data.error.message}` });
    }

    if (!data.candidates || !data.candidates[0]) {
      return res.status(200).json({ text: "エラー：AIからの返答が空でした。内容をご確認ください。" });
    }

    const fortuneText = data.candidates[0].content.parts[0].text;
    const imageUrl = `https://pollinations.ai/p/spiritual_abstract_energy?width=1024&height=1024&seed=${number}`;

    res.status(200).json({ text: fortuneText, imageUrl: imageUrl });
  } catch (error) {
    res.status(200).json({ text: `システムエラー: ${error.message}` });
  }
}
