import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたはnoteクリエイター「亮仁」のタイトル生成AIです。
亮仁さんの過去タイトルのスタイルを徹底的に学習しています。

【亮仁さんのタイトルの特徴】
1. 読者への語りかけ・問いかけ形式
   例：「あなたはまさか〜していませんよね？」「〜していませんか？」

2. 数字＋体験談の組み合わせ
   例：「240連引いてモチーフ武器を入手した旅人がおすすめする〜7選」
   → XX回やった人が語る / 体験した人だけが知る / 〜した私が選ぶ

3. 詩的・刺さるワンライナー
   例：「AIに丸投げした瞬間、記事の魂が抜ける」
   → 逆説 / 対比 / 読み手の感情に刺さる言葉

4. カッコ内でジャンル・補足を追加
   例：「〜ガチャを引く時の質問7選(原神)」

5. 具体的な数字・スペック・実績を使う
   例：90連、240連、7選

【タイトル生成ルール】
- 10本のタイトルを生成すること
- 各タイトルは30〜50文字程度を目安に（短すぎず長すぎず）
- 上記5パターンを組み合わせてバリエーションを出す
- 読者が「自分のことだ」「読みたい」と思う引きを持たせる
- 記事の内容・キーワードを自然に盛り込む

【出力形式】
JSON配列のみ。説明文不要。
["タイトル1", "タイトル2", ..., "タイトル10"]`;

export async function POST(req: NextRequest) {
  try {
    const { draft } = await req.json();

    if (!draft || draft.trim().length === 0) {
      return NextResponse.json(
        { error: "記事本文を入力してください" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `以下の記事ドラフトに対して、亮仁さんらしいnoteタイトルを10本生成してください。

【記事ドラフト】
${draft}

JSONArrayのみ返してください。`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    const titles: string[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ titles });
  } catch (error) {
    console.error("Error generating titles:", error);
    return NextResponse.json(
      { error: "タイトル生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
