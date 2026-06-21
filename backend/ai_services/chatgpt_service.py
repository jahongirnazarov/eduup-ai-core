# -*- coding: utf-8 -*-
"""
🤖 CHATGPT AI SERVICE
Integration with OpenAI/Groq API for conversational AI.
"""
import os
import httpx
from typing import Dict, Any, Optional, List
from backend.settings import settings


class ChatGPTService:
    """ChatGPT AI service for conversational queries"""
    
    def __init__(self):
        self.api_keys = settings.groq_api_keys_list or settings.openai_api_keys_list
        self.current_key_index = 0
        self.base_url = "https://api.groq.com/openai/v1" if settings.groq_api_keys_list else "https://api.openai.com/v1"
        self.model = "llama3-70b-8192" if settings.groq_api_keys_list else "gpt-4-turbo-preview"
    
    def _get_next_api_key(self) -> str:
        """Rotate through API keys for load balancing"""
        if not self.api_keys:
            raise ValueError("No API keys configured")
        key = self.api_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return key
    
    async def query(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Query ChatGPT with prompt and optional context"""
        headers = {
            "Authorization": f"Bearer {self._get_next_api_key()}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if context:
            messages.append({
                "role": "system",
                "content": f"Context: {context}"
            })
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "response": data["choices"][0]["message"]["content"],
                    "model": data["model"],
                    "usage": data.get("usage", {}),
                    "status": "success"
                }
            except Exception as e:
                return {
                    "response": f"Error: {str(e)}",
                    "status": "error",
                    "error": str(e)
                }
    
    async def stream_query(self, prompt: str, context: Optional[Dict[str, Any]] = None):
        """Stream ChatGPT response for real-time interaction"""
        headers = {
            "Authorization": f"Bearer {self._get_next_api_key()}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if context:
            messages.append({
                "role": "system",
                "content": f"Context: {context}"
            })
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000,
            "stream": True
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        yield data
