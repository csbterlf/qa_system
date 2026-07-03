import json
import os

class KnowledgeBase:
    def __init__(self, file_path="data/qa_data.json"):
        self.file_path = file_path
        self.data = []
        self.load()
    
    def load(self):
        """从 JSON 文件加载知识库"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            print(f"📚 已加载 {len(self.data)} 条知识")
        except FileNotFoundError:
            print(f"⚠️ 文件 {self.file_path} 不存在，使用空知识库")
            self.data = []
        except json.JSONDecodeError:
            print(f"⚠️ 文件 {self.file_path} 格式错误")
            self.data = []
    
    def get_all(self):
        """获取所有知识"""
        return self.data
    
    def add(self, question, answer):
        """新增知识"""
        self.data.append({"question": question, "answer": answer})
        self._save()
    
    def _save(self):
        """保存到文件"""
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)