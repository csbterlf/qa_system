'''1.启动服务方式:  python app_offline_enhanced.py'''

from flask import Flask, request, jsonify
from flask_cors import CORS  # 新增：导入跨域支持
import json

app = Flask(__name__)
CORS(app)  # 新增：允许所有跨域请求

# 加载知识库
def load_qa_data():
    try:
        with open("qa_data.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("⚠️ qa_data.json 不存在")
        return []
    except json.JSONDecodeError:
        print("⚠️ qa_data.json 格式错误，请检查JSON格式")
        return []

qa_data = load_qa_data()
print(f"📚 已加载 {len(qa_data)} 条知识")

# 简单的关键词匹配
def find_answer(question):
    question = question.lower()
    best_answer = "抱歉，我的知识库里没有这个问题的答案。"
    best_score = 0
    
    for item in qa_data:
        stored_q = item["question"].lower()
        # 计算关键词匹配度
        q_words = set(question.replace("？", "").replace("?", "").split())
        stored_words = set(stored_q.replace("？", "").replace("?", "").split())
        common = q_words & stored_words
        score = len(common) / max(len(stored_words), 1)
        
        if score > best_score and score > 0.3:
            best_score = score
            best_answer = item["answer"]
    
    return best_answer, best_score

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI问答系统已启动！"})

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        question = data.get("question", "")
        if not question:
            return jsonify({"error": "请提供问题"}), 400
        
        answer, confidence = find_answer(question)
        return jsonify({
            "question": question,
            "answer": answer,
            "confidence": confidence,
            "knowledge_base_size": len(qa_data)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 AI智能问答系统（离线增强版）启动中...")
    print(f"📚 知识库条目: {len(qa_data)}")
    print("🌐 访问地址: http://localhost:5000")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000, debug=True)