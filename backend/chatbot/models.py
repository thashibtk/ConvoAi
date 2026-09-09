from django.db import models
from django.utils import timezone

import secrets

def generate_widget_token():
    return secrets.token_hex(3)

class Site(models.Model):
    name = models.CharField(max_length=255)
    site_id = models.CharField(max_length=100, unique=True, help_text="Unique identifier for the site's widget script")
    widget_token = models.CharField(max_length=10, default=generate_widget_token, help_text="Secret 6-character token for the widget")
    user_id = models.CharField(max_length=255, null=True, blank=True, help_text="Supabase User ID")
    
    # Widget Customization
    bot_name = models.CharField(max_length=100, default='AI Assistant')
    theme_color = models.CharField(max_length=50, default='#000000')
    theme_mode = models.CharField(max_length=10, default='light', choices=(('light', 'Light'), ('dark', 'Dark')))
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Document(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='documents')
    raw_text = models.TextField(help_text="Raw content for this document (e.g. pasted text, product data)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.site.name} ({self.created_at.strftime('%Y-%m-%d')})"

class Chunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    text = models.TextField()
    embedding = models.JSONField(help_text="Vector embedding stored as a JSON array of floats")
    index = models.IntegerField(default=0, help_text="Order of chunk in the document")
    
    def __str__(self):
        return f"Chunk {self.index} of {self.document}"

class Conversation(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='conversations')
    session_id = models.CharField(max_length=255, help_text="Unique session ID from the visitor's browser")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation on {self.site.name} - {self.session_id}"

class Message(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('bot', 'Bot'),
    )
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    text = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.text[:20]}..."
