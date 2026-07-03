from flask import Flask, request, jsonify
from transformers import pipeline
import json

app = Flask(__name__)

# 加载预训练的问答模型
qa_pipeline = pipeline("question-answering", model="bert-base-uncased", tokenizer="bert-base-uncased")

# 加载你的问答对，并拼接成一个大的上下文
def load_context():
    with open("qa_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    # 简单地把所有答案拼接起来作为上下文，实际项目中可以做更精细的检索
    return " ".join([item["answer"] for item in data])

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question", "")
    context = load_context()
    result = qa_pipeline(question=question, context=context)
    return jsonify({"answer": result["answer"]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)