// 简化版聊天脚本 - 直接调用 Render 后端
import { API_CONFIG } from './config.js';

let sessionId = null;
let lastReply = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
    const status = document.getElementById('status');

    // 测试后端连接
    testBackend();

    // 发送消息
    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 生成语音
    voiceBtn.addEventListener('click', () => generateVoice());

    async function testBackend() {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/`);
            const data = await response.json();
            if (data.status === 'ok') {
                status.textContent = '在线';
                status.classList.add('online');
            }
        } catch (error) {
            status.textContent = '离线';
            console.error('后端连接失败:', error);
        }
    }

    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;

        // 显示用户消息
        addMessage(message, 'me');
        input.value = '';
        sendBtn.disabled = true;

        try {
            // 调用后端
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.chat}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId
                })
            });

            const data = await response.json();
            sessionId = data.session_id;
            lastReply = data.reply;

            // 显示回复
            addMessage(data.reply, 'other');
            voiceBtn.disabled = false;

        } catch (error) {
            console.error('发送失败:', error);
            addMessage('发送失败，请重试', 'system');
        } finally {
            sendBtn.disabled = false;
        }
    }

    async function generateVoice() {
        if (!lastReply) return;

        voiceBtn.disabled = true;
        voiceBtn.textContent = '生成中...';

        try {
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.tts}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: lastReply
                })
            });

            const data = await response.json();
            const audioUrl = `${API_CONFIG.baseURL}${data.audio_url}`;

            // 播放音频
            const audio = new Audio(audioUrl);
            audio.play();

            voiceBtn.textContent = '语音';
        } catch (error) {
            console.error('语音生成失败:', error);
            alert('语音生成失败');
        } finally {
            voiceBtn.disabled = false;
            voiceBtn.textContent = '语音';
        }
    }

    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = type === 'me' ? '我' : '流';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        messages.appendChild(messageDiv);

        // 滚动到底部
        messages.scrollTop = messages.scrollHeight;
    }
});
