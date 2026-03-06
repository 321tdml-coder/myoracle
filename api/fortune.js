export default async function handler(req, res) {
  const { date, number } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. 占いテキストの生成
  const textPrompt = `あなたは易経、西洋占星術、波動に精通した占い師です。
  入力: 日時(${date}), 9桁の数字(${number})。
  対象者: 1970年3月3日生まれ。
  この数字から易経の卦を導き出し、今日の波動を魅力的な日本語で占ってください。
  最後に、幸運を呼ぶ「光のイメージ」を1文で添えてください。`;

  const textRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: textPrompt }] }] })
  });
  
  const textData = await textRes.json();
  const fortuneText = textData.candidates[0].content.parts[0].text;

  // 2. 画像生成（Pollinationsを使用：Geminiの占い結果をシード値に反映）
  // ufotable/Ghibli風の抽象画を指定
  const imagePrompt = `abstract ethereal energy, ufo table and studio ghibli style, vibrant cosmic light, spiritual vibration, high quality, 4k --no people --no text`;
  const seed = number; // 9桁の数字をシードにする
  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&seed=${seed}`;

  res.status(200).json({ text: fortuneText, imageUrl: imageUrl });
}
