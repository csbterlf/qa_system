
        // ============================================================
        //  JavaScript 逻辑
        // ============================================================

        // ---- 获取页面元素 ----
        const chatArea = document.getElementById('chatArea');
        const inputBox = document.getElementById('inputBox');
        const sendBtn = document.getElementById('sendBtn');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');


        // ---- API 地址 ----
        const API_URL = 'https://qa-system-zan7.onrender.com/ask';

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


            // static/js/script.js 新增部分
        const IMAGE_API_URL = window.location.origin + '/ask_image';

        // ---- 语音识别 ----
        const voiceBtn = document.getElementById('voiceBtn');
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = true;

        voiceBtn.addEventListener('click', function() {
            recognition.start();
            voiceBtn.textContent = '🔴';
        });

        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            inputBox.value = transcript;
            // 可选：识别完成后自动发送
            if (event.results[0].isFinal) {
                voiceBtn.textContent = '🎤';
                sendQuestion(transcript);
            }
        };

        recognition.onerror = function() {
            voiceBtn.textContent = '🎤';
            addMessage('bot', '⚠️ 语音识别失败，请检查麦克风权限或手动输入。');
        };

        // ---- 图片上传 ----
        const imageBtn = document.getElementById('imageBtn');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        imageBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.onchange = async function(event) {
            const file = event.target.files[0];
            if (!file) return;

            addMessage('user', `[图片] ${file.name}`);
            const botMessageId = addBotTyping();

            try {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = async function() {
                    const base64Data = reader.result.split(',')[1];
                    
                    const response = await fetch(IMAGE_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64Data })
                    });
                    const data = await response.json();
                    
                    removeBotTyping(botMessageId);
                    addMessage('bot', data.answer || '识别完成');
                };
            } catch (error) {
                removeBotTyping(botMessageId);
                addMessage('bot', '❌ 图片上传失败: ' + error.message);
            }
            
            fileInput.value = ''; // 重置文件选择
        };


    