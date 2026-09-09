from django.urls import path
from .views import ChatAPIView, SiteListCreateView, SiteDetailView, SiteConfigView, DocumentListCreateView, CrawlAPIView

urlpatterns = [
    path('chat/', ChatAPIView.as_view(), name='chat'),
    path('sites/', SiteListCreateView.as_view(), name='site-list'),
    path('sites/<int:pk>/', SiteDetailView.as_view(), name='site-detail'),
    path('sites/config/<path:site_id>/', SiteConfigView.as_view(), name='site-config'),
    path('documents/', DocumentListCreateView.as_view(), name='document-list'),
    path('crawl/', CrawlAPIView.as_view(), name='crawl'),
]
