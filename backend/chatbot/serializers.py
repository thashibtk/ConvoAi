from rest_framework import serializers
from .models import Site, Document

class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'name', 'site_id', 'user_id', 'bot_name', 'theme_color', 'theme_mode', 'widget_token', 'created_at']

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'site', 'raw_text', 'created_at']
