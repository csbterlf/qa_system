from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# 使用更小的模型（仅 60MB，下载更快）
print("⏳ 加载小型模型...")
qa_pipeline = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")
print("✅ 模型加载完成！")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question", "")
    context = "BERT的全称是Bidirectional Encoder Representations from Transformers。Python是一种编程语言。"
    result = qa_pipeline(question=question, context=context)
    return jsonify({"answer": result["answer"]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)