<script lang="ts">
    import { onMount } from "svelte";
    let chat = "";
    let messages = [];
    let isLoading = false;

    onMount(() => {
        messages = [
            { 
                role: "ai", 
                content: "Hello! I'm your AI-ssistant. How can I help you today?"
            }
        ];
    });

    const onSubmit = async () => {
        if (!chat.trim() || isLoading) return;

        const userContent = chat.trim();
        chat = "";
        
        const userMessage = { role: "user", content: userContent };
        messages = [...messages, userMessage];

        isLoading = true;
        scrollToBottom();

        try {
            const req = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat: userContent })
            });

            const res = await req.json();
            
            // Remove <think>...</think> sections using regex
            let cleanReply = res.reply.replace(/<think>.*?<\/think>/gs, "").trim();

            // Default response if the AI does not know the answer
            if (!cleanReply || cleanReply.toLowerCase().includes("i don't know")) {
                cleanReply = "Oops! I do not know that as I am still a newborn AI.";
            }

            messages = [...messages, { role: "ai", content: cleanReply }];
        } catch (error) {
            console.error("Error:", error);
            messages = [...messages, { role: "ai", content: "An error occurred. Please try again." }];
        } finally {
            isLoading = false;
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            const chatContainer = document.getElementById("chat-container");
            if (chatContainer) {
                chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
            }
        }, 100);
    };

    const closeApp = () => {
        window.close();
    };
</script>

<div class="flex flex-col items-center justify-center h-screen bg-[#343541] text-white font-sans">
    <div class="w-full max-w-3xl h-[90vh] bg-[#202123] rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-700 relative">
        
        <!-- Close Button -->
        <button 
            on:click={closeApp} 
            class="absolute top-3 right-3 text-red-500 hover:text-red-700 text-2xl font-bold">
            ✖
        </button>

        <div class="py-3 px-4 border-b border-gray-600 bg-[#2A2B30] text-center rounded-t-xl">
            <h1 class="text-lg font-medium">AI-ssistant</h1>
        </div>

        <!-- Chat container -->
        <div id="chat-container" class="flex-1 overflow-y-auto p-4 space-y-3">
            {#each messages as message, i}
                <div class="flex {message.role === 'ai' ? 'justify-start' : 'justify-end'}">
                    <div class="max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-2xl text-sm md:text-base break-words 
                        {message.role === 'ai' ? 'bg-[#444654] text-white rounded-bl-none' : 'bg-[#0084ff] text-white rounded-br-none'}">
                        {message.content}
                    </div>
                </div>
            {/each}

            {#if isLoading}
                <div class="flex justify-start">
                    <div class="max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-2xl bg-[#444654] text-white rounded-bl-none flex gap-2 items-center">
                        <div class="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <div class="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        <div class="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="p-4 bg-[#2A2B30] border-t border-gray-700 rounded-b-xl">
            <div class="max-w-2xl mx-auto relative">
                <input bind:value={chat} 
                    placeholder="Ask me anything!"
                    class="w-full p-3 pr-12 border border-gray-600 rounded-full bg-[#40414F] text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    on:keypress={(e) => e.key === 'Enter' && onSubmit()} />
                <button 
                    on:click={onSubmit}
                    disabled={!chat.trim() || isLoading}
                    class="absolute right-2 top-2 p-2 text-gray-400 hover:text-white rounded-full {chat.trim() && !isLoading ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 transform rotate-90">
                        <path d="M5 10.2L19 4.5L13.3 18.5L11 12L5 10.2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    :global(body) {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        margin: 0;
        padding: 0;
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }
    .animate-bounce {
        animation: bounce 1s infinite;
    }
</style>
