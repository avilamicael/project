from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FilialViewSet,
    CategoriaFinanceiraViewSet,
    FornecedorViewSet,
    FormaPagamentoViewSet,
    ContasPagarViewSet
)

router = DefaultRouter()
router.register(r'filiais', FilialViewSet, basename='filial')
router.register(r'categorias', CategoriaFinanceiraViewSet, basename='categoria')
router.register(r'fornecedores', FornecedorViewSet, basename='fornecedor')
router.register(r'formas-pagamento', FormaPagamentoViewSet, basename='formapagamento')
router.register(r'contas-pagar', ContasPagarViewSet, basename='contapagar')

app_name = 'financeiro'

urlpatterns = [
    path('', include(router.urls)),
]