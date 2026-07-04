# app.py
from dotenv import load_dotenv
load_dotenv()  # 加载 .env 文件中的环境变量

import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from config import Config
from core.knowledge_base import KnowledgeBase
from core.matcher import Matcher

app = Flask(__name__)
CORS(app)

# 初始化知识库
kb = KnowledgeBase(Config.KNOWLEDGE_FILE)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        question = data.get("question", "")
        if not question:
            return jsonify({"error": "请提供问题"}), 400

        # 直接调用同步的 match 方法（无需异步）
        answer, confidence = Matcher.match(question, kb.get_all())

        return jsonify({
            "question": question,
            "answer": answer,
            "confidence": confidence,
            "knowledge_base_size": len(kb.get_all())
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/knowledge/add", methods=["POST"])
def add_knowledge():
    data = request.json
    question = data.get("question")
    answer = data.get("answer")
    if not question or not answer:
        return jsonify({"error": "请提供 question 和 answer"}), 400
    
    kb.add(question, answer)
    return jsonify({"message": "知识添加成功", "total": len(kb.get_all())})

# app.py 新增部分
@app.route("/ask_image", methods=["POST"])
def ask_image():
    try:
        data = request.json
        image_base64 = data.get("image", "")
        question = data.get("question", "请详细描述这张图片的内容")
        if not image_base64:
            return jsonify({"error": "请提供图片"}), 400

        answer, confidence = Matcher.match_image(image_base64, question)
        return jsonify({
            "answer": answer,
            "confidence": confidence
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 AI智能问答系统 V0.3 启动中...")
    print(f"📚 知识库条目: {len(kb.get_all())}")
    print(f"🌐 访问地址: http://{Config.HOST}:{Config.PORT}")
    print("=" * 50)
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)