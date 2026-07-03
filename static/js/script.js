
        // ============================================================
        //  JavaScript 逻辑
        // ============================================================

        // ---- 获取页面元素 ----
        const chatArea = document.getElementById('chatArea');
        const inputBox = document.getElementById('inputBox');
        const sendBtn = document.getElementById('sendBtn');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');

        // ---- API 地址 ----
        const API_URL = 'http://localhost:5000/ask';

        // ---- 发送消息函数 ----
        async function sendQuestion(question) {
            // 1. 如果问题为空，不发送
            if (!question || question.trim() === '') return;

            // 2. 清空输入框
            inputBox.value = '';

            // 3. 在聊天区域显示用户的问题
            addMessage('user', question);

            // 4. 显示机器人 "正在思考..." 的占位消息
            const botMessageId = addBotTyping();

            try {
                // 5. 调用后端 API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: question })
                });

                const data = await response.json();

                // 6. 移除 "正在思考..." 的占位
                removeBotTyping(botMessageId);

                // 7. 显示机器人的回复
                const answer = data.answer || '抱歉，我没有理解你的问题。';
                const confidence = data.confidence ? ` (置信度: ${Math.round(data.confidence * 100)}%)` : '';
                addMessage('bot', answer + confidence);

            } catch (error) {
                // 如果请求失败
                removeBotTyping(botMessageId);
                addMessage('bot', '❌ 连接服务器失败，请确认后端服务是否正在运行 (python app_offline_enhanced.py)');
                console.error('请求错误:', error);
            }
        }

        // ---- 添加普通消息 ----
        function addMessage(type, content) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;

            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.textContent = type === 'user' ? '👤' : '🤖';

            const bubble = document.createElement('div');
            bubble.className = 'bubble';

            // 支持换行
            bubble.innerHTML = content.replace(/\n/g, '<br>');

            // 添加时间
            const time = document.createElement('div');
            time.className = 'time';
            const now = new Date();
            time.textContent = now.getHours().toString().padStart(2, '0') + ':' + 
                              now.getMinutes().toString().padStart(2, '0');

            bubble.appendChild(time);

            if (type === 'user') {
                messageDiv.appendChild(bubble);
                messageDiv.appendChild(avatar);
            } else {
                messageDiv.appendChild(avatar);
                messageDiv.appendChild(bubble);
            }

            chatArea.appendChild(messageDiv);
            // 滚动到底部
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // ---- 添加"正在思考..."占位 ----
        function addBotTyping() {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot';
            messageDiv.id = 'typing-' + Date.now();

            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.textContent = '🤖';

            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.innerHTML = `
                <div class="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;

            messageDiv.appendChild(avatar);
            messageDiv.appendChild(bubble);
            chatArea.appendChild(messageDiv);
            chatArea.scrollTop = chatArea.scrollHeight;

            return messageDiv.id;
        }

        // ---- 移除"正在思考..."占位 ----
        function removeBotTyping(id) {
            const typingEl = document.getElementById(id);
            if (typingEl) {
                typingEl.remove();
            }
        }

        // ---- 事件绑定 ----

        // 点击发送按钮
        sendBtn.addEventListener('click', function() {
            const question = inputBox.value.trim();
            sendQuestion(question);
        });

        // 按 Enter 键发送
        inputBox.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const question = inputBox.value.trim();
                sendQuestion(question);
            }
        });

        // 点击快捷提问按钮
        suggestionBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const question = this.getAttribute('data-q');
                sendQuestion(question);
            });
        });

        // ---- 输入框自动获得焦点 ----
        inputBox.focus();

        console.log('🚀 AI 问答前端已加载！');
        console.log('📡 后端 API 地址:', API_URL);
    