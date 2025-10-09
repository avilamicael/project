from rest_framework import serializers
from .models import Filial, CategoriaFinanceira, Fornecedor, FormaPagamento, ContasPagar
from core.middleware import get_current_company


class FilialSerializer(serializers.ModelSerializer):
    # Retorna o nome do company ao inves do uuid
    company = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Filial
        fields = [
            'id', 'nome', 'cnpj', 'endereco', 'cidade', 'estado',
            'telefone', 'email', 'ativa', 'company', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        company = get_current_company()
        user = self.context['request'].user
        
        if company:
            validated_data['company'] = company
        if user:  
            validated_data['created_by'] = user  
            validated_data['updated_by'] = user  
            
        return super().create(validated_data)

class CategoriaFinanceiraSerializer(serializers.ModelSerializer):
    company = serializers.StringRelatedField(read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = CategoriaFinanceira
        fields = [
            'id', 'nome', 'tipo', 'tipo_display', 'cor', 'ativa',
            'company', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        company = get_current_company()
        user = self.context['request'].user
        
        if company:
            validated_data['company'] = company
        if user:  
            validated_data['created_by'] = user  
            validated_data['updated_by'] = user  

        return super().create(validated_data)


class FornecedorSerializer(serializers.ModelSerializer):
    company = serializers.StringRelatedField(read_only=True)
    tipo_pessoa_display = serializers.CharField(source='get_tipo_pessoa_display', read_only=True)
    
    class Meta:
        model = Fornecedor
        fields = [
            'id', 'nome', 'nome_fantasia', 'tipo_pessoa', 'tipo_pessoa_display',
            'cpf_cnpj', 'inscricao_estadual', 'email', 'telefone',
            'endereco', 'cidade', 'estado', 'cep', 'ativo', 'observacoes',
            'company', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        company = get_current_company()
        user = self.context['request'].user
        
        if company:
            validated_data['company'] = company
        if user:  
            validated_data['created_by'] = user  
            validated_data['updated_by'] = user  

        return super().create(validated_data)


class FormaPagamentoSerializer(serializers.ModelSerializer):
    company = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = FormaPagamento
        fields = [
            'id', 'nome', 'ativa', 'company', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        company = get_current_company()
        user = self.context['request'].user
        
        if company:
            validated_data['company'] = company
        if user:  
            validated_data['created_by'] = user  
            validated_data['updated_by'] = user 

        return super().create(validated_data) 


class ContasPagarSerializer(serializers.ModelSerializer):
    company = serializers.StringRelatedField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    quantidade_recorrencias = serializers.IntegerField(write_only=True, required=False, default=1)
    frequencia_recorrencia_display = serializers.CharField(
        source='get_frequencia_recorrencia_display', 
        read_only=True
    )
    
    # Campos calculados
    valor_final = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    valor_restante = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    esta_vencida = serializers.BooleanField(read_only=True)
    percentual_pago = serializers.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        read_only=True
    )
    
    # Relacionamentos aninhados (para leitura)
    filial_detalhes = FilialSerializer(source='filial', read_only=True)
    fornecedor_detalhes = FornecedorSerializer(source='fornecedor', read_only=True)
    categoria_detalhes = CategoriaFinanceiraSerializer(source='categoria', read_only=True)
    forma_pagamento_detalhes = FormaPagamentoSerializer(source='forma_pagamento', read_only=True)
    
    class Meta:
        model = ContasPagar
        fields = [
            'id', 'filial', 'filial_detalhes', 'descricao',
            'fornecedor', 'fornecedor_detalhes',
            'categoria', 'categoria_detalhes',
            'valor_original', 'desconto', 'juros', 'multa', 'valor_pago',
            'valor_final', 'valor_restante', 'percentual_pago',
            'data_vencimento', 'data_pagamento',
            'forma_pagamento', 'forma_pagamento_detalhes',
            'status', 'status_display', 'esta_vencida',
            'e_parcelada', 'parcela_atual', 'total_parcelas', 'grupo_parcelamento',
            'e_recorrente', 'frequencia_recorrencia', 'quantidade_recorrencias', 'frequencia_recorrencia_display',
            'notas_fiscais', 'numero_boleto', 'observacoes', 'anexo',
            'company', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = [
            'id', 'company', 'created_at', 'updated_at', 
            'created_by', 'updated_by', 'data_emissao'
        ]
    
    def create(self, validated_data):
        company = get_current_company()
        user = self.context['request'].user

        # Remove campos que não pertencem ao model (usados apenas para lógica de criação)
        validated_data.pop('quantidade_recorrencias', None)

        if company:
            validated_data['company'] = company
        if user:
            validated_data['created_by'] = user

        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user:
            validated_data['updated_by'] = user
        
        return super().update(instance, validated_data)


class ContasPagarListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem (performance)"""

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    valor_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    valor_restante = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    esta_vencida = serializers.BooleanField(read_only=True)

    filial_id = serializers.CharField(source='filial.id', read_only=True)
    filial_nome = serializers.CharField(source='filial.nome', read_only=True)
    fornecedor_id = serializers.CharField(source='fornecedor.id', read_only=True)
    fornecedor_nome = serializers.CharField(source='fornecedor.nome', read_only=True)
    categoria_id = serializers.CharField(source='categoria.id', read_only=True)
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)

    class Meta:
        model = ContasPagar
        fields = [
            'id', 'descricao',
            'filial_id', 'filial_nome',
            'fornecedor_id', 'fornecedor_nome',
            'categoria_id', 'categoria_nome',
            'valor_original', 'valor_final', 'valor_restante', 'valor_pago',
            'data_vencimento', 'data_pagamento', 'data_emissao',
            'status', 'status_display',
            'esta_vencida', 'e_parcelada', 'parcela_atual', 'total_parcelas'
        ]