from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
from companies.serializers import CompanySerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customiza o token JWT para incluir dados adicionais"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adiciona dados extras ao token
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'company': {
                'id': str(self.user.company.id),
                'name': self.user.company.name,
                'slug': self.user.company.slug,
            } if self.user.company else None
        }
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Adiciona claims customizados ao token
        token['email'] = user.email
        token['role'] = user.role
        if user.company:
            token['company_id'] = str(user.company.id)
        
        return token


class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'company', 'role', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

