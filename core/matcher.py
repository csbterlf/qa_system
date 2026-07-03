class Matcher:
    @staticmethod
    def match(question, knowledge_data):
        """根据问题匹配最佳答案"""
        question = question.lower()
        best_answer = "抱歉，我的知识库里没有这个问题的答案。"
        best_score = 0
        
        for item in knowledge_data:
            stored_q = item["question"].lower()
            # 简单关键词匹配
            q_words = set(question.replace("？", "").replace("?", "").split())
            stored_words = set(stored_q.replace("？", "").replace("?", "").split())
            common = q_words & stored_words
            score = len(common) / max(len(stored_words), 1)
            
            if score > best_score and score > 0.3:
                best_score = score
                best_answer = item["answer"]
        
        return best_answer, best_score