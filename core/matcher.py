# core/matcher.py
import os
from zhipuai import ZhipuAI

class Matcher:
    # 从环境变量读取 API Key
    client = ZhipuAI(api_key=os.getenv("ZHIPUAI_API_KEY"))

    @staticmethod
    def match(question, knowledge_data=None):
        """使用智谱AI大模型生成智能答案"""
        try:
            # 调用智谱AI对话接口
            response = Matcher.client.chat.completions.create(
                model="glm-4-flash",  # 性价比高的模型，响应快
                messages=[
                    {"role": "system", "content": "你是一个智能问答助手，请用简洁、准确的中文回答用户的问题。"},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,  # 控制回答的创造性
                max_tokens=500    # 最大输出长度
            )
            answer = response.choices[0].message.content
            return answer, 0.95
        except Exception as e:
            error_msg = str(e)
            # 常见错误提示
            if "api_key" in error_msg.lower():
                return "❌ API Key 无效，请检查 .env 文件中的 ZHIPUAI_API_KEY 是否正确", 0.0
            elif "network" in error_msg.lower() or "timeout" in error_msg.lower():
                return "❌ 网络连接失败，请检查网络后重试", 0.0
            else:
                return f"❌ AI服务异常: {error_msg}", 0.0