from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Site, Document, Chunk, Conversation, Message

import threading
from .services.crawler import crawl_and_ingest

@admin.register(Site)
class SiteAdmin(ModelAdmin):
    list_display = ('name', 'site_id', 'created_at')
    search_fields = ('name', 'site_id')
    actions = ['crawl_website']

    def crawl_website(self, request, queryset):
        for site in queryset:
            url = site.site_id
            if url.startswith('http'):
                thread = threading.Thread(target=crawl_and_ingest, args=(site, url, 20))
                thread.start()
                self.message_user(request, f"Started background crawler for {url} (max 20 pages). Documents will appear shortly.")
            else:
                self.message_user(request, f"Cannot crawl {site.name} because site_id '{url}' is not a valid URL.")
    crawl_website.short_description = "Crawl and ingest this site's URL"

@admin.register(Document)
class DocumentAdmin(ModelAdmin):
    list_display = ('id', 'site', 'created_at')
    list_filter = ('site',)

@admin.register(Chunk)
class ChunkAdmin(ModelAdmin):
    list_display = ('id', 'document', 'index')
    list_filter = ('document__site',)
    # Don't show the massive JSON array in the list display

@admin.register(Conversation)
class ConversationAdmin(ModelAdmin):
    list_display = ('id', 'site', 'session_id', 'created_at')
    list_filter = ('site',)
    search_fields = ('session_id',)

@admin.register(Message)
class MessageAdmin(ModelAdmin):
    list_display = ('id', 'conversation', 'role', 'timestamp')
    list_filter = ('role', 'conversation__site')
