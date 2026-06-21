# -*- coding: utf-8 -*-
"""
Telegram Channel Scraper Module
Automatically scrapes educational content from Telegram channels
"""
import asyncio
import logging
from typing import List, Dict, Optional
from datetime import datetime
from telethon import TelegramClient, events
from telethon.tl.types import Channel, MessageMediaPhoto, MessageMediaDocument
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class TelegramChannelScraper:
    """Telegram channel scraper for educational content"""
    
    def __init__(self):
        self.api_id = os.getenv("TELEGRAM_API_ID")
        self.api_hash = os.getenv("TELEGRAM_API_HASH")
        self.phone_number = os.getenv("TELEGRAM_PHONE_NUMBER")
        self.client = None
        self.monitored_channels = []
        
    async def initialize(self):
        """Initialize Telegram client"""
        if not all([self.api_id, self.api_hash, self.phone_number]):
            logger.error("Missing Telegram credentials in environment variables")
            raise ValueError("Telegram API credentials not configured")
            
        self.client = TelegramClient('telegram_scraper_session', int(self.api_id), self.api_hash)
        await self.client.start(self.phone_number)
        logger.info("✅ Telegram client initialized successfully")
        
    async def scrape_channel_messages(self, channel_username: str, limit: int = 100) -> List[Dict]:
        """
        Scrape messages from a specific Telegram channel
        
        Args:
            channel_username: Channel username (e.g., @channel_name)
            limit: Maximum number of messages to scrape
            
        Returns:
            List of message dictionaries
        """
        if not self.client:
            await self.initialize()
            
        messages_data = []
        try:
            channel_entity = await self.client.get_entity(channel_username)
            logger.info(f"📡 Scraping channel: {channel_username}")
            
            async for message in self.client.iter_messages(channel_entity, limit=limit):
                if message.text:
                    message_data = {
                        "id": message.id,
                        "date": message.date.isoformat(),
                        "text": message.text,
                        "channel": channel_username,
                        "views": getattr(message, 'views', 0),
                        "forwards": getattr(message, 'forwards', 0),
                        "replies": getattr(message, 'replies', 0)
                    }
                    messages_data.append(message_data)
                    
            logger.info(f"✅ Scraped {len(messages_data)} messages from {channel_username}")
            return messages_data
            
        except Exception as e:
            logger.error(f"❌ Error scraping channel {channel_username}: {str(e)}")
            return []
            
    async def scrape_multiple_channels(self, channel_usernames: List[str], limit: int = 50) -> Dict[str, List[Dict]]:
        """
        Scrape messages from multiple channels
        
        Args:
            channel_usernames: List of channel usernames
            limit: Maximum messages per channel
            
        Returns:
            Dictionary with channel names as keys and message lists as values
        """
        all_messages = {}
        
        for channel in channel_usernames:
            messages = await self.scrape_channel_messages(channel, limit)
            all_messages[channel] = messages
            
        return all_messages
        
    async def filter_educational_content(self, messages: List[Dict], keywords: List[str] = None) -> List[Dict]:
        """
        Filter messages for educational content based on keywords
        
        Args:
            messages: List of message dictionaries
            keywords: List of keywords to filter by (default: educational terms)
            
        Returns:
            Filtered list of messages
        """
        if keywords is None:
            keywords = [
                "imtihon", "test", "savol", "javob", "matematika", "fizika", 
                "kimyo", "biologiya", "tarix", "geografiya", "ingliz tili",
                "exam", "question", "answer", "math", "physics", "chemistry",
                "biology", "history", "geography", "english", "test variant",
                "dts", "bmba", "dtm", "piima", "attestatsiya", "toifa"
            ]
            
        filtered = []
        for msg in messages:
            text_lower = msg["text"].lower()
            if any(keyword.lower() in text_lower for keyword in keywords):
                filtered.append(msg)
                
        logger.info(f"🎯 Filtered {len(filtered)} educational messages from {len(messages)} total")
        return filtered
        
    async def extract_questions_from_messages(self, messages: List[Dict]) -> List[str]:
        """
        Extract potential questions from messages
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            List of extracted question texts
        """
        questions = []
        
        for msg in messages:
            text = msg["text"]
            # Simple pattern matching for questions
            if "?" in text or any(word in text.lower() for word in ["savol", "question", "test"]):
                questions.append(text)
                
        logger.info(f"📝 Extracted {len(questions)} potential questions from messages")
        return questions
        
    async def add_monitored_channel(self, channel_username: str) -> bool:
        """
        Add a channel to the monitoring list
        
        Args:
            channel_username: Channel username to monitor
            
        Returns:
            True if successful
        """
        try:
            channel_entity = await self.client.get_entity(channel_username)
            if channel_username not in self.monitored_channels:
                self.monitored_channels.append(channel_username)
                logger.info(f"➕ Added channel to monitoring: {channel_username}")
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Error adding channel {channel_username}: {str(e)}")
            return False
            
    async def remove_monitored_channel(self, channel_username: str) -> bool:
        """
        Remove a channel from the monitoring list
        
        Args:
            channel_username: Channel username to remove
            
        Returns:
            True if successful
        """
        if channel_username in self.monitored_channels:
            self.monitored_channels.remove(channel_username)
            logger.info(f"➖ Removed channel from monitoring: {channel_username}")
            return True
        return False
        
    async def get_monitored_channels(self) -> List[str]:
        """Get list of monitored channels"""
        return self.monitored_channels.copy()
        
    async def close(self):
        """Close the Telegram client"""
        if self.client:
            await self.client.disconnect()
            logger.info("🔌 Telegram client disconnected")

# Global scraper instance
telegram_scraper = TelegramChannelScraper()
