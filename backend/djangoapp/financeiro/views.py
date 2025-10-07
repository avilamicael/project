from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import uuid
from django_filters.rest_framework import DjangoFilterBackend
from .models import Filial, CategoriaFinanceira, Fornecedor, FormaPagamento, ContasPagar
from datetime import timedelta
from dateutil.relativedelta import relativedelta
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

    def create(self, request, *args, **kwargs):
        """
        Cria uma ou várias contas a pagar (recorrentes).
        Se 'e_recorrente' for True e 'quantidade_recorrencias' > 1,
        gera múltiplos lançamentos conforme a frequência informada.
        """
        data = request.data.copy()
        quantidade = int(data.get('quantidade_recorrencias', 1))
        e_recorrente = data.get('e_recorrente', False)
        frequencia = data.get('frequencia_recorrencia')
        contas_criadas = []

        # Serializa e valida os dados de entrada
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Caso seja uma conta única (não recorrente)
        if not e_recorrente or quantidade <= 1:
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Caso seja recorrente → cria várias contas com vencimentos diferentes
        primeira_data = serializer.validated_data['data_vencimento']

        for i in range(quantidade):
            nova_data = self._adicionar_periodo(primeira_data, frequencia, i)
            nova_conta_data = serializer.validated_data.copy()

            # 🔹 Remove campos que não pertencem ao modelo
            nova_conta_data.pop('quantidade_recorrencias', None)

            # 🔹 Ajusta campos dinâmicos
            nova_conta_data['data_vencimento'] = nova_data
            nova_conta_data['descricao'] = f"{nova_conta_data['descricao']} ({i+1}/{quantidade})"
            nova_conta_data['e_recorrente'] = True
            nova_conta_data['grupo_parcelamento'] = uuid.uuid4()

            # 🔹 Define empresa e usuário criador (compatível com BaseCompanyModel)
            company = getattr(request.user, 'company', None)
            if company:
                nova_conta_data['company'] = company
            nova_conta_data['created_by'] = request.user
            nova_conta_data['updated_by'] = request.user

            # Cria a nova conta
            conta = ContasPagar.objects.create(**nova_conta_data)
            contas_criadas.append(conta)

        # Serializa o retorno com todas as contas criadas
        output_serializer = self.get_serializer(contas_criadas, many=True)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


    def _adicionar_periodo(self, data_inicial, frequencia, n):
        if not data_inicial or n == 0:
            return data_inicial

        if frequencia == 'semanal':
            return data_inicial + timedelta(weeks=n)
        elif frequencia == 'quinzenal':
            return data_inicial + timedelta(days=15 * n)
        elif frequencia == 'mensal':
            return data_inicial + relativedelta(months=n)
        elif frequencia == 'bimestral':
            return data_inicial + relativedelta(months=2 * n)
        elif frequencia == 'trimestral':
            return data_inicial + relativedelta(months=3 * n)
        elif frequencia == 'semestral':
            return data_inicial + relativedelta(months=6 * n)
        elif frequencia == 'anual':
            return data_inicial + relativedelta(years=n)

        # Caso a frequência não seja reconhecida, retorna a data original
        return data_inicial
