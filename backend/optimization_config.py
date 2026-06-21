# -*- coding: utf-8 -*-
"""
🚀 Optimization Configuration
Central configuration for performance optimizations
"""
from typing import Dict, Any


class OptimizationConfig:
    """Performance optimization settings"""
    
    # Bot Configuration
    BOT_CONFIG = {
        'use_lite_version': True,
        'cache_size': 1000,
        'message_cache_ttl': 3600,
        'lazy_load_dependencies': True,
        'enable_performance_monitoring': True,
        'max_concurrent_updates': 10,
        'drop_pending_updates': True,
        'allowed_updates': ['message', 'callback_query']
    }
    
    # Cache Configuration
    CACHE_CONFIG = {
        'default_ttl': 3600,
        'max_size': 10000,
        'cleanup_interval': 300,
        'enable_response_cache': True,
        'response_cache_ttl': 300,
        'enable_pattern_invalidation': True
    }
    
    # Mini App Configuration
    MINI_APP_CONFIG = {
        'enable_lazy_loading': True,
        'enable_image_optimization': True,
        'use_minified_assets': True,
        'enable_offline_support': True,
        'cache_static_files': True,
        'use_webp_images': True,
        'enable_compression': True
    }
    
    # API Configuration
    API_CONFIG = {
        'enable_rate_limiting': True,
        'rate_limit_per_minute': 60,
        'enable_compression': True,
        'compression_min_size': 1000,
        'enable_cors': True,
        'cors_origins': ['*'],
        'enable_request_validation': True
    }
    
    # Database Configuration
    DB_CONFIG = {
        'connection_pool_size': 10,
        'max_overflow': 20,
        'pool_recycle': 3600,
        'enable_query_caching': True,
        'query_cache_ttl': 300,
        'enable_connection_pooling': True
    }
    
    # Monitoring Configuration
    MONITORING_CONFIG = {
        'enable_performance_monitoring': True,
        'enable_system_monitoring': True,
        'enable_response_time_tracking': True,
        'slow_endpoint_threshold_ms': 500,
        'memory_warning_threshold_mb': 100,
        'cpu_warning_threshold_percent': 80,
        'log_performance_summary': True,
        'performance_log_interval': 300
    }
    
    # Frontend Configuration
    FRONTEND_CONFIG = {
        'enable_minification': True,
        'enable_bundling': True,
        'enable_tree_shaking': True,
        'enable_code_splitting': True,
        'enable_lazy_loading': True,
        'enable_image_optimization': True,
        'enable_cdn': False,
        'cdn_url': ''
    }
    
    @classmethod
    def get_all_configs(cls) -> Dict[str, Any]:
        """Get all configuration dictionaries"""
        return {
            'bot': cls.BOT_CONFIG,
            'cache': cls.CACHE_CONFIG,
            'mini_app': cls.MINI_APP_CONFIG,
            'api': cls.API_CONFIG,
            'database': cls.DB_CONFIG,
            'monitoring': cls.MONITORING_CONFIG,
            'frontend': cls.FRONTEND_CONFIG
        }
    
    @classmethod
    def get_config(cls, config_name: str) -> Dict[str, Any]:
        """Get specific configuration"""
        configs = cls.get_all_configs()
        return configs.get(config_name, {})
    
    @classmethod
    def is_optimization_enabled(cls, feature: str) -> bool:
        """Check if optimization feature is enabled"""
        config_map = {
            'lite_bot': cls.BOT_CONFIG['use_lite_version'],
            'caching': cls.CACHE_CONFIG['default_ttl'] > 0,
            'monitoring': cls.MONITORING_CONFIG['enable_performance_monitoring'],
            'compression': cls.API_CONFIG['enable_compression'],
            'lazy_loading': cls.MINI_APP_CONFIG['enable_lazy_loading']
        }
        return config_map.get(feature, False)
