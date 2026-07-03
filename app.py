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
        
        answer, confidence = Matcher.match(question, kb.get_all())
        
        return jsonify({
            "question": question,
            "answer": answer,
            "confidence": round(confidence, 2),
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

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 AI智能问答系统 V0.2 启动中...")
    print(f"📚 知识库条目: {len(kb.get_all())}")
    print(f"🌐 访问地址: http://{Config.HOST}:{Config.PORT}")
    print("=" * 50)
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)