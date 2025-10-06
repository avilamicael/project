from django.contrib import admin
from .models import Filial, CategoriaFinanceira, Fornecedor, FormaPagamento, ContasPagar


@admin.register(Filial)
class FilialAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cnpj', 'cidade', 'estado', 'ativa', 'company']
    list_filter = ['ativa', 'estado', 'company']
    search_fields = ['nome', 'cnpj', 'cidade']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(CategoriaFinanceira)
class CategoriaFinanceiraAdmin(admin.ModelAdmin):
    list_display = ['nome', 'tipo', 'cor', 'ativa', 'company']
    list_filter = ['tipo', 'ativa', 'company']
    search_fields = ['nome']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = ['nome', 'nome_fantasia', 'tipo_pessoa', 'cpf_cnpj', 'cidade', 'ativo', 'company']
    list_filter = ['tipo_pessoa', 'ativo', 'estado', 'company']
    search_fields = ['nome', 'nome_fantasia', 'cpf_cnpj']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(FormaPagamento)
class FormaPagamentoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'ativa', 'company']
    list_filter = ['ativa', 'company']
    search_fields = ['nome']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ContasPagar)
class ContasPagarAdmin(admin.ModelAdmin):
    list_display = [
        'descricao', 'filial', 'fornecedor', 'valor_final',
        'data_vencimento', 'status', 'company'
    ]
    list_filter = ['status', 'filial', 'categoria', 'e_parcelada', 'e_recorrente', 'company']
    search_fields = ['descricao', 'notas_fiscais', 'numero_boleto']
    readonly_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
    date_hierarchy = 'data_vencimento'