// LLM Chat Interface

let chatHistory = [];
let chatOpen = false;

function toggleChat() {
    chatOpen = !chatOpen;
    const chatWidget = document.getElementById('chat-widget');
    const chatButton = document.getElementById('chat-toggle-btn');
    
    if (chatOpen) {
        chatWidget.classList.remove('hidden');
        chatButton.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        chatWidget.classList.add('hidden');
        chatButton.innerHTML = '<i class="fas fa-comments"></i>';
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || !currentDatasetId) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    input.value = '';
    
    // Try streaming first, fallback to non-streaming on error
    try {
        await sendChatMessageStreaming(message);
    } catch (error) {
        console.error('Streaming failed, using fallback:', error);
        await sendChatMessageFallback(message);
    }
}

async function sendChatMessageStreaming(message) {
    // Show typing indicator with streaming status
    const typingDiv = addMessageToChat('assistant', '...', true);
    
    // Create streaming message container
    const messagesContainer = document.getElementById('chat-messages');
    const streamingDiv = document.createElement('div');
    streamingDiv.className = 'chat-message assistant streaming-message';
    streamingDiv.innerHTML = `
        <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--accent); color: white;">
                <i class="fas fa-brain text-sm"></i>
            </div>
            <div class="neu-card px-4 py-2 max-w-[80%]" style="color: var(--text-primary);">
                <div class="streaming-content"></div>
            </div>
        </div>
    `;
    streamingDiv.style.display = 'none';
    messagesContainer.appendChild(streamingDiv);
    
    const contentDiv = streamingDiv.querySelector('.streaming-content');
    let accumulatedContent = '';
    let toolCalls = [];
    
    // Make POST request to initiate streaming
    const response = await fetch(`/api/chat/${currentDatasetId}/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message,
            conversationHistory: chatHistory
        })
    });
    
    if (!response.ok) {
        throw new Error('Streaming request failed');
    }
    
    // Remove typing indicator, show streaming container
    removeTypingIndicator();
    streamingDiv.style.display = 'block';
    
    // Parse SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                try {
                    const event = JSON.parse(data);
                    
                    if (event.type === 'content') {
                        // Append content token
                        accumulatedContent += event.content;
                        contentDiv.innerHTML = formatMessage(accumulatedContent);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        
                    } else if (event.type === 'tool_calls_start') {
                        // Show tool execution indicator
                        contentDiv.innerHTML = formatMessage(accumulatedContent) + 
                            '<br><i class="fas fa-cog fa-spin text-sm"></i> <span style="color: var(--text-secondary); font-size: 0.9em;">Querying database...</span>';
                        
                    } else if (event.type === 'tool_call') {
                        // Track tool call
                        console.log('Tool executed:', event.name);
                        
                    } else if (event.type === 'tool_calls_complete') {
                        // Remove tool indicator, store tools for badge display
                        contentDiv.innerHTML = formatMessage(accumulatedContent);
                        toolCalls = event.tools || [];
                        
                    } else if (event.type === 'suggestions') {
                        // Will add suggestions after done
                        
                    } else if (event.type === 'done') {
                        // Streaming complete
                        break;
                        
                    } else if (event.error) {
                        throw new Error(event.error);
                    }
                } catch (e) {
                    console.error('Failed to parse SSE event:', e);
                }
            }
        }
    }
    
    // Remove streaming class
    streamingDiv.classList.remove('streaming-message');
    
    // Show tool call badges if any
    if (toolCalls.length > 0) {
        addToolCallBadges(toolCalls);
    }
    
    // Store in history
    chatHistory.push({ role: 'user', content: message });
    chatHistory.push({ role: 'assistant', content: accumulatedContent });
}

async function sendChatMessageFallback(message) {
    // Show typing indicator
    addMessageToChat('assistant', '...', true);
    
    try {
        const response = await axios.post(`/api/chat/${currentDatasetId}`, {
            message,
            conversationHistory: chatHistory
        });
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show tool call badges if any tools were used
        if (response.data.tool_calls && response.data.tool_calls.length > 0) {
            addToolCallBadges(response.data.tool_calls);
        }
        
        // Add assistant response
        addMessageToChat('assistant', response.data.message);
        
        // Show suggestions
        if (response.data.suggestions && response.data.suggestions.length > 0) {
            addSuggestionsToChat(response.data.suggestions);
        }
        
        // Store in history
        chatHistory.push({ role: 'user', content: message });
        chatHistory.push({ role: 'assistant', content: response.data.message });
        
    } catch (error) {
        removeTypingIndicator();
        
        // Check if it's an API key configuration error
        if (error.response && error.response.data && error.response.data.message) {
            addMessageToChat('assistant', error.response.data.message);
        } else {
            addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again.');
        }
        
        console.error('Chat error:', error);
    }
}

function addMessageToChat(role, content, isTyping = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role} ${isTyping ? 'typing' : ''}`;
    
    if (role === 'user') {
        messageDiv.innerHTML = `
            <div class="flex justify-end mb-3">
                <div class="neu-card px-4 py-2 max-w-[80%]" style="background: var(--accent); color: white;">
                    ${content}
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="flex items-start gap-3 mb-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--accent); color: white;">
                    <i class="fas fa-brain text-sm"></i>
                </div>
                <div class="neu-card px-4 py-2 max-w-[80%]" style="color: var(--text-primary);">
                    ${isTyping ? '<i class="fas fa-spinner fa-spin"></i> Thinking...' : formatMessage(content)}
                </div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv; // Return element for reference
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.chat-message.typing');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function addToolCallBadges(toolCalls) {
    const messagesContainer = document.getElementById('chat-messages');
    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'tool-call-badges mb-2';
    
    // Icon mapping for different tools
    const toolIcons = {
        'get_outlier_columns': 'fa-exclamation-triangle',
        'get_correlation_analysis': 'fa-project-diagram',
        'get_column_statistics': 'fa-chart-bar',
        'search_analyses': 'fa-search',
        'get_data_sample': 'fa-table',
        'get_missing_values': 'fa-question-circle',
        'suggest_data_cleaning': 'fa-broom'
    };
    
    // Human-readable tool names
    const toolNames = {
        'get_outlier_columns': 'Outliers',
        'get_correlation_analysis': 'Correlations',
        'get_column_statistics': 'Statistics',
        'search_analyses': 'Search',
        'get_data_sample': 'Data Sample',
        'get_missing_values': 'Missing Values',
        'suggest_data_cleaning': 'Cleaning'
    };
    
    badgesDiv.innerHTML = `
        <div class="flex flex-wrap gap-2 pl-11">
            <span class="text-xs" style="color: var(--text-secondary); line-height: 2;">
                <i class="fas fa-tools"></i> Tools used:
            </span>
            ${toolCalls.map(tc => {
                const icon = toolIcons[tc.name] || 'fa-cog';
                const name = toolNames[tc.name] || tc.name;
                return `
                    <span class="neu-badge" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        padding: 4px 8px;
                        font-size: 11px;
                        border-radius: 12px;
                        background: var(--bg-secondary);
                        box-shadow: inset 2px 2px 4px var(--shadow-dark), 
                                    inset -2px -2px 4px var(--shadow-light);
                        color: var(--accent);
                        font-weight: 500;
                    ">
                        <i class="fas ${icon}"></i>
                        ${name}
                    </span>
                `;
            }).join('')}
        </div>
    `;
    messagesContainer.appendChild(badgesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSuggestionsToChat(suggestions) {
    const messagesContainer = document.getElementById('chat-messages');
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'chat-suggestions mb-3';
    suggestionsDiv.innerHTML = `
        <div class="flex flex-wrap gap-2 pl-11">
            ${suggestions.map(s => `
                <button onclick="askSuggestion('${s.replace(/'/g, "\\'")}')" 
                        class="neu-button text-sm px-3 py-1" 
                        style="color: var(--accent);">
                    ${s}
                </button>
            `).join('')}
        </div>
    `;
    messagesContainer.appendChild(suggestionsDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function askSuggestion(question) {
    document.getElementById('chat-input').value = question;
    sendChatMessage();
}

function formatMessage(text) {
    // Convert newlines to <br>
    return text.replace(/\n/g, '<br>');
}

function clearChat() {
    chatHistory = [];
    document.getElementById('chat-messages').innerHTML = `
        <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--accent); color: white;">
                <i class="fas fa-brain text-sm"></i>
            </div>
            <div class="neu-card px-4 py-2 max-w-[80%]" style="color: var(--text-primary);">
                👋 Hi! I'm your data analysis assistant. I can help you understand patterns, correlations, and insights in your data. What would you like to know?
            </div>
        </div>
    `;
}

// Handle Enter key in chat input
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
});
