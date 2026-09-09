import os
from google import genai
from groq import Groq
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse
from .models import Site, Conversation, Message, Document
from .serializers import SiteSerializer, DocumentSerializer
from .services.retrieval import retrieve_context
from .services.ingestion import ingest_document
from .services.crawler import crawl_and_ingest

class SiteListCreateView(generics.ListCreateAPIView):
    serializer_class = SiteSerializer

    def get_queryset(self):
        queryset = Site.objects.all()
        user_id = self.request.query_params.get('user_id', None)
        if user_id is not None:
            queryset = queryset.filter(user_id=user_id)
        return queryset

class SiteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer

class SiteConfigView(APIView):
    def get(self, request, site_id):
        try:
            site = Site.objects.get(site_id=site_id)
            token = request.query_params.get('token')
            if site.widget_token != token:
                return Response({"error": "Forbidden: invalid token"}, status=status.HTTP_403_FORBIDDEN)
                
            return Response({
                "bot_name": site.bot_name,
                "theme_color": site.theme_color,
                "theme_mode": site.theme_mode,
            }, status=status.HTTP_200_OK)
        except Site.DoesNotExist:
            return Response({"error": "Site not found"}, status=status.HTTP_404_NOT_FOUND)

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        queryset = Document.objects.all()
        site_id = self.request.query_params.get('site_id', None)
        if site_id is not None:
            queryset = queryset.filter(site__site_id=site_id)
        return queryset

    def perform_create(self, serializer):
        document = serializer.save()
        try:
            ingest_document(document)
        except Exception as e:
            print(f"Error during ingestion: {e}")

class ChatAPIView(APIView):
    def post(self, request):
        site_id = request.data.get('site_id')
        user_message = request.data.get('message')
        session_id = request.data.get('session_id', 'default_session')
        token = request.data.get('token')
        
        if not site_id or not user_message:
            return Response({"error": "site_id and message are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            site = Site.objects.get(site_id=site_id)
            if site.widget_token != token:
                return Response({"error": "Forbidden: invalid token"}, status=status.HTTP_403_FORBIDDEN)
        except Site.DoesNotExist:
            return Response({"error": "Site not found"}, status=status.HTTP_404_NOT_FOUND)
            
        conversation, _ = Conversation.objects.get_or_create(site=site, session_id=session_id)
        context = retrieve_context(site, user_message)
        
        system_prompt = (
            f"You are a friendly, professional AI assistant for {site.name}. "
            f"Your job is to assist users by answering their questions accurately. "
            f"Use the following knowledge base context to answer the user. "
            f"If you cannot answer the question using the context, politely state that you do not have that information, without mentioning the word 'context' or 'database'.\n\nContext:\n{context}"
        )
        
        try:
            recent_messages = list(conversation.messages.order_by('-timestamp')[:5])
            recent_messages.reverse()
            
            groq_messages = [
                {"role": "system", "content": system_prompt}
            ]
            for msg in recent_messages:
                role = 'assistant' if msg.role == 'bot' else 'user'
                groq_messages.append({"role": role, "content": msg.text})
                
            groq_messages.append({"role": "user", "content": user_message})
            
            Message.objects.create(conversation=conversation, role='user', text=user_message)
            
            def stream_generator():
                client = Groq(api_key=os.environ.get('GROQ_API_KEY', ''))
                stream = client.chat.completions.create(
                    model="openai/gpt-oss-20b",
                    messages=groq_messages,
                    stream=True,
                )
                
                full_text = ""
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        full_text += chunk.choices[0].delta.content
                        yield chunk.choices[0].delta.content
                
                Message.objects.create(conversation=conversation, role='bot', text=full_text)
            
            response_stream = StreamingHttpResponse(stream_generator(), content_type='text/event-stream')
            response_stream['Cache-Control'] = 'no-cache'
            response_stream['X-Accel-Buffering'] = 'no'
            return response_stream
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CrawlAPIView(APIView):
    def post(self, request):
        site_id = request.data.get('site_id')
        url = request.data.get('url')
        max_pages = request.data.get('max_pages', 20)
        
        if not site_id or not url:
            return Response({"error": "site_id and url are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            site = Site.objects.get(site_id=site_id)
        except Site.DoesNotExist:
            return Response({"error": "Site not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Run crawler synchronously so frontend can await completion
        pages = crawl_and_ingest(site, url, max_pages)
        
        return Response({
            "status": "success", 
            "message": f"Successfully crawled {pages} pages for {url}",
            "pages_crawled": pages
        }, status=status.HTTP_200_OK)
