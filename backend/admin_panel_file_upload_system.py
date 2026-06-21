# -*- coding: utf-8 -*-
"""
📁 ADMIN PANEL FILE UPLOAD SYSTEM
Multi-format file upload with auto-regeneration and copyright safety
Supports PDF, DOCX, TXT, JSON, and other educational content formats
"""
import os
import json
import hashlib
import mimetypes
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import shutil
from dataclasses import dataclass


@dataclass
class UploadedFile:
    """Uploaded file metadata"""
    file_id: str
    original_filename: str
    file_type: str
    file_size: int
    upload_path: str
    uploaded_at: str
    content_type: str
    subject: str
    exam_type: str
    processing_status: str
    copyright_safety_score: float
    regeneration_status: str


class AdminFileUploadSystem:
    """
    Admin panel file upload system with auto-regeneration
    Supports multiple formats and automatic content processing
    """
    
    def __init__(self):
        self.upload_dir = self._setup_upload_directory()
        self.processed_dir = self._setup_processed_directory()
        self.database_file = os.path.join(self.upload_dir, "file_registry.json")
        self.file_registry = self._load_file_registry()
        self.supported_formats = {
            "pdf": [".pdf"],
            "document": [".docx", ".doc", ".txt", ".rtf"],
            "data": [".json", ".csv", ".xlsx", ".xls"],
            "image": [".jpg", ".jpeg", ".png", ".gif"],
            "audio": [".mp3", ".wav", ".ogg"],
            "video": [".mp4", ".avi", ".mov"]
        }
    
    def _setup_upload_directory(self) -> str:
        """Setup upload directory"""
        base_dir = os.path.dirname(os.path.dirname(__file__))
        upload_dir = os.path.join(base_dir, "data", "admin_uploads")
        os.makedirs(upload_dir, exist_ok=True)
        return upload_dir
    
    def _setup_processed_directory(self) -> str:
        """Setup processed content directory"""
        processed_dir = os.path.join(self.upload_dir, "processed")
        os.makedirs(processed_dir, exist_ok=True)
        return processed_dir
    
    def _load_file_registry(self) -> Dict[str, Dict]:
        """Load file registry from database"""
        try:
            if os.path.exists(self.database_file):
                with open(self.database_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading file registry: {e}")
        return {}
    
    def _save_file_registry(self):
        """Save file registry to database"""
        try:
            with open(self.database_file, 'w', encoding='utf-8') as f:
                json.dump(self.file_registry, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving file registry: {e}")
    
    def _generate_file_id(self, filename: str) -> str:
        """Generate unique file ID"""
        timestamp = datetime.now().isoformat()
        unique_string = f"{filename}_{timestamp}"
        return hashlib.sha256(unique_string.encode()).hexdigest()[:16]
    
    def _detect_file_type(self, filename: str) -> str:
        """Detect file type from extension"""
        ext = Path(filename).suffix.lower()
        
        for file_type, extensions in self.supported_formats.items():
            if ext in extensions:
                return file_type
        
        return "unknown"
    
    def _get_mime_type(self, filename: str) -> str:
        """Get MIME type of file"""
        mime_type, _ = mimetypes.guess_type(filename)
        return mime_type or "application/octet-stream"
    
    def upload_file(self, file_data: bytes, filename: str, subject: str, 
                   exam_type: str, uploaded_by: str = "admin") -> Dict[str, Any]:
        """
        Upload file to system
        Args:
            file_data: Raw file bytes
            filename: Original filename
            subject: Subject (e.g., "ielts_listening", "sat_math")
            exam_type: Exam type (e.g., "ielts", "sat")
            uploaded_by: User who uploaded the file
        """
        try:
            # Validate file
            validation_result = self._validate_file(file_data, filename)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": validation_result["error"]
                }
            
            # Generate file ID
            file_id = self._generate_file_id(filename)
            
            # Create upload path
            file_type = self._detect_file_type(filename)
            upload_path = os.path.join(self.upload_dir, f"{file_id}_{filename}")
            
            # Save file
            with open(upload_path, 'wb') as f:
                f.write(file_data)
            
            # Create file metadata
            uploaded_file = UploadedFile(
                file_id=file_id,
                original_filename=filename,
                file_type=file_type,
                file_size=len(file_data),
                upload_path=upload_path,
                uploaded_at=datetime.now().isoformat(),
                content_type=self._get_mime_type(filename),
                subject=subject,
                exam_type=exam_type,
                processing_status="uploaded",
                copyright_safety_score=0.0,
                regeneration_status="pending"
            )
            
            # Save to registry
            self.file_registry[file_id] = {
                "file_id": file_id,
                "original_filename": filename,
                "file_type": file_type,
                "file_size": len(file_data),
                "upload_path": upload_path,
                "uploaded_at": uploaded_file.uploaded_at,
                "content_type": uploaded_file.content_type,
                "subject": subject,
                "exam_type": exam_type,
                "processing_status": "uploaded",
                "copyright_safety_score": 0.0,
                "regeneration_status": "pending",
                "uploaded_by": uploaded_by
            }
            
            self._save_file_registry()
            
            # Trigger auto-processing
            self._trigger_auto_processing(file_id)
            
            return {
                "success": True,
                "file_id": file_id,
                "filename": filename,
                "file_type": file_type,
                "file_size": len(file_data),
                "subject": subject,
                "exam_type": exam_type,
                "processing_status": "uploaded",
                "message": "File uploaded successfully. Auto-processing initiated."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Upload failed: {str(e)}"
            }
    
    def _validate_file(self, file_data: bytes, filename: str) -> Dict[str, Any]:
        """Validate uploaded file"""
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if len(file_data) > max_size:
            return {
                "valid": False,
                "error": f"File size exceeds maximum limit of {max_size} bytes"
            }
        
        # Check file type
        file_type = self._detect_file_type(filename)
        if file_type == "unknown":
            return {
                "valid": False,
                "error": "Unsupported file format"
            }
        
        # Check for malicious content (basic check)
        if b'<script' in file_data.lower() or b'javascript:' in file_data.lower():
            return {
                "valid": False,
                "error": "Potentially malicious content detected"
            }
        
        return {"valid": True}
    
    def _trigger_auto_processing(self, file_id: str):
        """Trigger automatic processing of uploaded file"""
        try:
            from backend.ai_services.copyright_safe_content_generator import get_copyright_safe_generator
            from backend.ai_services.auto_regeneration_engine import get_auto_regeneration_engine
            
            # Get file info
            file_info = self.file_registry.get(file_id)
            if not file_info:
                return
            
            # Update status
            file_info["processing_status"] = "processing"
            self._save_file_registry()
            
            # Extract content based on file type
            content = self._extract_file_content(file_info["upload_path"], file_info["file_type"])
            
            # Generate copyright-safe content
            generator = get_copyright_safe_generator()
            result = generator.generate_copyright_safe_content(
                content_type=file_info["subject"],
                topic=file_info["exam_type"],
                source_material=content
            )
            
            # Update copyright safety score
            file_info["copyright_safety_score"] = result["copyright_safety_score"]
            file_info["processing_status"] = "copyright_checked"
            self._save_file_registry()
            
            # Trigger regeneration
            regenerator = get_auto_regeneration_engine()
            regen_result = regenerator.regenerate_content(
                file_id=file_id,
                original_content=content,
                copyright_safe_content=result["generated_content"]
            )
            
            # Update regeneration status
            file_info["regeneration_status"] = "completed" if regen_result["success"] else "failed"
            file_info["processing_status"] = "completed"
            self._save_file_registry()
            
        except Exception as e:
            print(f"Auto-processing failed for file {file_id}: {e}")
            if file_id in self.file_registry:
                self.file_registry[file_id]["processing_status"] = "failed"
                self._save_file_registry()
    
    def _extract_file_content(self, file_path: str, file_type: str) -> str:
        """Extract text content from file based on type"""
        try:
            if file_type == "document":
                if file_path.endswith('.txt'):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return f.read()
                elif file_path.endswith('.json'):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return json.dumps(json.load(f), indent=2)
                # For DOCX, PDF - would need additional libraries
                # For now, return placeholder
                return f"Content extracted from {file_path}"
            
            elif file_type == "data":
                if file_path.endswith('.json'):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return json.dumps(json.load(f), indent=2)
                elif file_path.endswith('.csv'):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return f.read()
                return f"Data extracted from {file_path}"
            
            else:
                # For binary files, return metadata
                return f"Binary file content: {file_path}"
                
        except Exception as e:
            print(f"Error extracting content from {file_path}: {e}")
            return f"Error extracting content: {str(e)}"
    
    def get_file_info(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get information about uploaded file"""
        return self.file_registry.get(file_id)
    
    def list_uploaded_files(self, subject: Optional[str] = None, 
                           exam_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all uploaded files, optionally filtered"""
        files = []
        
        for file_id, file_info in self.file_registry.items():
            if subject and file_info["subject"] != subject:
                continue
            if exam_type and file_info["exam_type"] != exam_type:
                continue
            
            files.append(file_info)
        
        return files
    
    def delete_file(self, file_id: str) -> Dict[str, Any]:
        """Delete uploaded file"""
        if file_id not in self.file_registry:
            return {
                "success": False,
                "error": "File not found"
            }
        
        try:
            file_info = self.file_registry[file_id]
            
            # Delete physical file
            if os.path.exists(file_info["upload_path"]):
                os.remove(file_info["upload_path"])
            
            # Delete from registry
            del self.file_registry[file_id]
            self._save_file_registry()
            
            return {
                "success": True,
                "message": f"File {file_id} deleted successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Delete failed: {str(e)}"
            }
    
    def get_processing_statistics(self) -> Dict[str, Any]:
        """Get statistics about file processing"""
        total_files = len(self.file_registry)
        processed_files = sum(1 for f in self.file_registry.values() 
                            if f["processing_status"] == "completed")
        failed_files = sum(1 for f in self.file_registry.values() 
                          if f["processing_status"] == "failed")
        pending_files = sum(1 for f in self.file_registry.values() 
                          if f["processing_status"] in ["uploaded", "processing"])
        
        avg_copyright_score = 0.0
        if total_files > 0:
            total_score = sum(f["copyright_safety_score"] for f in self.file_registry.values())
            avg_copyright_score = total_score / total_files
        
        return {
            "total_files": total_files,
            "processed_files": processed_files,
            "failed_files": failed_files,
            "pending_files": pending_files,
            "average_copyright_safety_score": round(avg_copyright_score, 3),
            "success_rate": round((processed_files / total_files * 100) if total_files > 0 else 0, 2)
        }
    
    def batch_upload_files(self, files_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Upload multiple files in batch
        Args:
            files_data: List of dicts with keys: file_data, filename, subject, exam_type
        """
        results = []
        success_count = 0
        failure_count = 0
        
        for file_data in files_data:
            result = self.upload_file(
                file_data=file_data["file_data"],
                filename=file_data["filename"],
                subject=file_data["subject"],
                exam_type=file_data["exam_type"],
                uploaded_by=file_data.get("uploaded_by", "admin")
            )
            
            results.append(result)
            
            if result["success"]:
                success_count += 1
            else:
                failure_count += 1
        
        return {
            "success": True,
            "total_files": len(files_data),
            "successful_uploads": success_count,
            "failed_uploads": failure_count,
            "results": results
        }


# Singleton instance
_admin_file_upload_system_instance = None

def get_admin_file_upload_system() -> AdminFileUploadSystem:
    """Get admin file upload system instance"""
    global _admin_file_upload_system_instance
    if _admin_file_upload_system_instance is None:
        _admin_file_upload_system_instance = AdminFileUploadSystem()
    return _admin_file_upload_system_instance
