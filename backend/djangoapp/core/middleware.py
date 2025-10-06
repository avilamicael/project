from threading import local
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

_thread_locals = local()

def get_current_company():
    """Retorna a company ativa no contexto atual"""
    return getattr(_thread_locals, 'company', None)

def set_current_company(company):
    """Define a company ativa no contexto atual"""
    _thread_locals.company = company


class CompanyMiddleware(MiddlewareMixin):
    """
    Middleware que identifica a company do usuário logado
    e define no contexto da thread
    """
    
    def process_request(self, request):
        set_current_company(None)
        
        # Tenta autenticar via JWT
        try:
            jwt_auth = JWTAuthentication()
            auth_result = jwt_auth.authenticate(request)
            
            if auth_result is not None:
                user, token = auth_result
                if hasattr(user, 'company') and user.company:
                    set_current_company(user.company)
        except (InvalidToken, Exception):
            pass
        
        return None
    
    def process_response(self, request, response):
        # Limpa o contexto após a requisição
        set_current_company(None)
        return response