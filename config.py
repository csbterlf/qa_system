class Config:
    # 服务器配置
    HOST = '0.0.0.0'
    PORT = 5000
    DEBUG = True
    
    # 数据文件路径
    KNOWLEDGE_FILE = 'data/qa_data.json'
    
    # 匹配阈值
    MIN_MATCH_SCORE = 0.3