// API 适配器 - 连接 Render 后端
import { API_CONFIG } from './config.js';

let sessionId = null;

export const APIAdapter = {
    // 发送消息到后端
    async sendMessage(message) {
        try {
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            sessionId = data.session_id;

            return {
                reply: data.reply,
                session_id: data.session_id,
                turn_count: data.turn_count
            };
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    },

    // 生成语音
    async generateTTS(text) {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.tts}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                audio_url: `${API_CONFIG.baseURL}${data.audio_url}`,
                audio_id: data.audio_id
            };
        } catch (error) {
            console.error('语音生成失败:', error);
            throw error;
        }
    },

    // 清空会话
    async clearSession() {
        if (!sessionId) return;

        try {
            await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.session}/${sessionId}`, {
                method: 'DELETE'
            });
            sessionId = null;
        } catch (error) {
            console.error('清空会话失败:', error);
        }
    },

    // 测试后端连接
    async testConnection() {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/`);
            const data = await response.json();
            return data.status === 'ok';
        } catch (error) {
            console.error('后端连接失败:', error);
            return false;
        }
    }
};
