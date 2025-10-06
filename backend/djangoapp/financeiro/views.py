from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Filial, CategoriaFinanceira, Fornecedor, FormaPagamento, ContasPagar
from .serializers import (
    FilialSerializer,
    CategoriaFinanceiraSerializer,
    FornecedorSerializer,
    FormaPagamentoSerializer,
    ContasPagarSerializer,
    ContasPagarListSerializer
)


class BaseCompanyViewSet(viewsets.ModelViewSet):
    """ViewSet base com filtro por company"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.company:
            return self.queryset.filter(company=user.company)
        return self.queryset.none()


class FilialViewSet(BaseCompanyViewSet):
    """ViewSet para CRUD de Filiais"""
    queryset = Filial.objects.all()
    serializer_class = FilialSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'cnpj', 'cidade']
    ordering_fields = ['nome', 'cidade', 'created_at']
    ordering = ['nome']


class CategoriaFinanceiraViewSet(BaseCompanyViewSet):
    """ViewSet para CRUD de Categorias Financeiras"""
    queryset = CategoriaFinanceira.objects.all()
    serializer_class = CategoriaFinanceiraSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'ativa']
    search_fields = ['nome']
    ordering_fields = ['nome', 'tipo', 'created_at']
    ordering = ['tipo', 'nome']


class FornecedorViewSet(BaseCompanyViewSet):
    """ViewSet para CRUD de Fornecedores"""
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo_pessoa', 'ativo', 'cidade', 'estado']
    search_fields = ['nome', 'nome_fantasia', 'cpf_cnpj']
    ordering_fields = ['nome', 'cidade', 'created_at']
    ordering = ['nome']


class FormaPagamentoViewSet(BaseCompanyViewSet):
    """ViewSet para CRUD de Formas de Pagamento"""
    queryset = FormaPagamento.objects.all()
    serializer_class = FormaPagamentoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome']
    ordering_fields = ['nome', 'created_at']
    ordering = ['nome']


class ContasPagarViewSet(BaseCompanyViewSet):
    """ViewSet para CRUD de Contas a Pagar"""
    queryset = ContasPagar.objects.select_related(
        'filial', 'fornecedor', 'categoria', 'forma_pagamento'
    ).all()
    serializer_class = ContasPagarSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'status', 'filial', 'fornecedor', 'categoria', 
        'e_parcelada', 'e_recorrente'
    ]
    search_fields = ['descricao', 'notas_fiscais', 'numero_boleto']
    ordering_fields = [
        'data_vencimento', 'data_emissao', 'data_pagamento',
        'valor_original', 'created_at'
    ]
    ordering = ['-data_vencimento']
    
    def get_serializer_class(self):
        """Usa serializer simplificado para listagem"""
        if self.action == 'list':
            return ContasPagarListSerializer
        return ContasPagarSerializer
    
    @action(detail=False, methods=['get'])
    def pendentes(self, request):
        """Retorna apenas contas pendentes"""
        queryset = self.get_queryset().filter(status='pendente')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vencidas(self, request):
        """Retorna apenas contas vencidas"""
        queryset = self.get_queryset().filter(status='vencida')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pagas(self, request):
        """Retorna apenas contas pagas"""
        queryset = self.get_queryset().filter(status='paga')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pagar(self, request, pk=None):
        """Marca uma conta como paga"""
        conta = self.get_object()
        valor_pago = request.data.get('valor_pago', conta.valor_final)
        data_pagamento = request.data.get('data_pagamento')
        
        conta.valor_pago = valor_pago
        if data_pagamento:
            conta.data_pagamento = data_pagamento
        conta.save()
        
        serializer = self.get_serializer(conta)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancela uma conta"""
        conta = self.get_object()
        conta.status = 'cancelada'
        conta.save()
        
        serializer = self.get_serializer(conta)
        return Response(serializer.data)