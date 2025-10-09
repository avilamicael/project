from django.db import models
from django.core.validators import MinValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import date
from django.utils import timezone
from core.models import BaseCompanyModel


class Filial(BaseCompanyModel):
    """Filiais da empresa"""
    
    nome = models.CharField('Nome', max_length=100)
    cnpj = models.CharField(
        'CNPJ',
        max_length=14,
        validators=[
            RegexValidator(
                regex=r'^\d{14}$',
                message='CNPJ deve conter exatamente 14 números'
            )
        ],
        help_text='Somente números (14 dígitos)'
    )
    endereco = models.CharField('Endereço', max_length=255, blank=True)
    cidade = models.CharField('Cidade', max_length=100, blank=True)
    estado = models.CharField('Estado', max_length=2, blank=True)
    telefone = models.CharField('Telefone', max_length=20, blank=True)
    email = models.EmailField('Email', blank=True)
    ativa = models.BooleanField('Ativa', default=True)
    
    class Meta:
        verbose_name = 'Filial'
        verbose_name_plural = 'Filiais'
        ordering = ['nome']
        unique_together = [['company', 'cnpj']]
    
    def __str__(self):
        return self.nome
    
    def save(self, *args, **kwargs):
        """Converte campos de texto para UPPERCASE"""
        if self.nome:
            self.nome = self.nome.upper()
        if self.endereco:
            self.endereco = self.endereco.upper()
        if self.cidade:
            self.cidade = self.cidade.upper()
        if self.estado:
            self.estado = self.estado.upper()
        if self.email:
            self.email = self.email.upper()
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validação customizada"""
        if self.cnpj:
            # Remove tudo que não é número
            self.cnpj = ''.join(filter(str.isdigit, self.cnpj))
            
            # Verifica se já existe outro CNPJ igual na mesma company
            if self.company:
                exists = Filial.objects.filter(
                    company=self.company,
                    cnpj=self.cnpj
                ).exclude(pk=self.pk).exists()
                
                if exists:
                    raise ValidationError({
                        'cnpj': 'Já existe uma filial com este CNPJ nesta empresa.'
                    })


class CategoriaFinanceira(BaseCompanyModel):
    """Categorias para organização financeira"""
    
    TIPO_CHOICES = [
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    ]
    
    nome = models.CharField('Nome', max_length=100)
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES)
    cor = models.CharField('Cor', max_length=7, default='#6B7280', help_text='Cor em hexadecimal')
    ativa = models.BooleanField('Ativa', default=True)
    
    class Meta:
        verbose_name = 'Categoria Financeira'
        verbose_name_plural = 'Categorias Financeiras'
        ordering = ['tipo', 'nome']
        unique_together = [['company', 'nome', 'tipo']]
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.nome}"
    
    def save(self, *args, **kwargs):
        """Converte nome para UPPERCASE"""
        if self.nome:
            self.nome = self.nome.upper()
        
        super().save(*args, **kwargs)


class Fornecedor(BaseCompanyModel):
    """Fornecedores da empresa"""
    
    TIPO_PESSOA_CHOICES = [
        ('fisica', 'Pessoa Física'),
        ('juridica', 'Pessoa Jurídica'),
    ]
    
    nome = models.CharField('Nome/Razão Social', max_length=200)
    nome_fantasia = models.CharField('Nome Fantasia', max_length=200, blank=True)
    tipo_pessoa = models.CharField('Tipo de Pessoa', max_length=10, choices=TIPO_PESSOA_CHOICES)
    cpf_cnpj = models.CharField(
        'CPF/CNPJ',
        max_length=14,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{11}$|^\d{14}$',
                message='CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'
            )
        ],
        help_text='Somente números (11 para CPF, 14 para CNPJ)'
    )
    inscricao_estadual = models.CharField(
        'Inscrição Estadual',
        max_length=20,
        blank=True,
        help_text='Somente números'
    )
    email = models.EmailField('Email', blank=True)
    telefone = models.CharField('Telefone', max_length=20, blank=True)
    endereco = models.CharField('Endereço', max_length=255, blank=True)
    cidade = models.CharField('Cidade', max_length=100, blank=True)
    estado = models.CharField('Estado', max_length=2, blank=True)
    cep = models.CharField('CEP', max_length=10, blank=True)
    ativo = models.BooleanField('Ativo', default=True)
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Fornecedor'
        verbose_name_plural = 'Fornecedores'
        ordering = ['nome']
    
    def __str__(self):
        return self.nome_fantasia or self.nome
    
    def save(self, *args, **kwargs):
        """Converte campos de texto para UPPERCASE"""
        if self.nome:
            self.nome = self.nome.upper()
        if self.nome_fantasia:
            self.nome_fantasia = self.nome_fantasia.upper()
        if self.email:
            self.email = self.email.upper()
        if self.endereco:
            self.endereco = self.endereco.upper()
        if self.cidade:
            self.cidade = self.cidade.upper()
        if self.estado:
            self.estado = self.estado.upper()
        if self.observacoes:
            self.observacoes = self.observacoes.upper()
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validação customizada"""
        if self.cpf_cnpj:
            # Remove tudo que não é número
            self.cpf_cnpj = ''.join(filter(str.isdigit, self.cpf_cnpj))
        
        if self.inscricao_estadual:
            # Remove tudo que não é número
            self.inscricao_estadual = ''.join(filter(str.isdigit, self.inscricao_estadual))


class FormaPagamento(BaseCompanyModel):
    """Formas de pagamento disponíveis"""
    
    nome = models.CharField('Nome', max_length=100)
    ativa = models.BooleanField('Ativa', default=True)
    
    class Meta:
        verbose_name = 'Forma de Pagamento'
        verbose_name_plural = 'Formas de Pagamento'
        ordering = ['nome']
        unique_together = [['company', 'nome']]
    
    def __str__(self):
        return self.nome
    
    def save(self, *args, **kwargs):
        """Converte nome para UPPERCASE"""
        if self.nome:
            self.nome = self.nome.upper()
        
        super().save(*args, **kwargs)


class ContasPagar(BaseCompanyModel):
    """
    Modelo para gerenciar contas a pagar com suporte a:
    - Pagamento único
    - Parcelamento
    - Recorrência
    """
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('vencida', 'Vencida'),
        ('paga', 'Paga'),
        ('paga_parcial', 'Paga Parcialmente'),
        ('cancelada', 'Cancelada'),
    ]
    
    FREQUENCIA_CHOICES = [
        ('semanal', 'Semanal'),
        ('quinzenal', 'Quinzenal'),
        ('mensal', 'Mensal'),
        ('bimestral', 'Bimestral'),
        ('trimestral', 'Trimestral'),
        ('semestral', 'Semestral'),
        ('anual', 'Anual'),
    ]
    
    # FILIAL - Campo obrigatório para isolamento por filial
    filial = models.ForeignKey(
        Filial,
        on_delete=models.PROTECT,
        verbose_name='Filial',
        related_name='contas_pagar',
        help_text='Filial responsável por esta conta'
    )
    
    # Informações básicas
    descricao = models.CharField('Descrição', max_length=200)
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.PROTECT,
        verbose_name='Fornecedor',
        related_name='contas_pagar'
    )
    categoria = models.ForeignKey(
        CategoriaFinanceira,
        on_delete=models.PROTECT,
        verbose_name='Categoria',
        related_name='contas_pagar',
        limit_choices_to={'tipo': 'despesa'}
    )
    
    # Valores
    valor_original = models.DecimalField(
        'Valor Original',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    desconto = models.DecimalField(
        'Desconto',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0'))]
    )
    juros = models.DecimalField(
        'Juros',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0'))]
    )
    multa = models.DecimalField(
        'Multa',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0'))]
    )
    valor_pago = models.DecimalField(
        'Valor Pago',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0'))]
    )
    
    # Datas - data_emissao agora tem default
    data_emissao = models.DateField(
        'Data de Emissão',
        default=timezone.now  # Preenche automaticamente com a data atual
    )
    data_vencimento = models.DateField('Data de Vencimento')
    data_pagamento = models.DateField('Data de Pagamento', null=True, blank=True)
    
    # Pagamento
    forma_pagamento = models.ForeignKey(
        FormaPagamento,
        on_delete=models.PROTECT,
        verbose_name='Forma de Pagamento',
        related_name='contas_pagar',
        null=True,
        blank=True
    )
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente'
    )
    
    # Parcelamento
    e_parcelada = models.BooleanField('É Parcelada?', default=False)
    parcela_atual = models.PositiveIntegerField('Parcela Atual', default=1)
    total_parcelas = models.PositiveIntegerField('Total de Parcelas', default=1)
    grupo_parcelamento = models.UUIDField(
        'Grupo de Parcelamento',
        null=True,
        blank=True,
        help_text='ID que agrupa todas as parcelas'
    )
    
    # Recorrência
    e_recorrente = models.BooleanField('É Recorrente?', default=False)
    frequencia_recorrencia = models.CharField(
        'Frequência de Recorrência',
        max_length=20,
        choices=FREQUENCIA_CHOICES,
        null=True,
        blank=True
    )
    
    # Documentos
    notas_fiscais = models.CharField(
        'Notas Fiscais',
        max_length=200,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^[\d,\s]*$',
                message='Notas fiscais devem conter apenas números, vírgulas e espaços'
            )
        ],
        help_text='Ex: 123, 456, 789'
    )
    numero_boleto = models.CharField(
        'Número do Boleto',
        max_length=100,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d*$',
                message='Número do boleto deve conter apenas números'
            )
        ],
        help_text='Somente números'
    )
    
    # Outros
    observacoes = models.TextField('Observações', blank=True)
    anexo = models.FileField(
        'Anexo',
        upload_to='contas_pagar/%Y/%m/',
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = 'Conta a Pagar'
        verbose_name_plural = 'Contas a Pagar'
        ordering = ['-data_vencimento', '-created_at']
        indexes = [
            models.Index(fields=['company', 'filial', 'status']),
            models.Index(fields=['company', 'filial', 'data_vencimento']),
        ]
    
    def __str__(self):
        filial_info = f"[{self.filial.nome}]" if self.filial else ""
        if self.e_parcelada:
            return f"{filial_info} {self.descricao} - Parcela {self.parcela_atual}/{self.total_parcelas}"
        return f"{filial_info} {self.descricao}"
    
    def save(self, *args, **kwargs):
        if self.descricao:
            self.descricao = self.descricao.upper()

        if self.notas_fiscais:
            self.notas_fiscais = self.notas_fiscais.upper()

        if self.observacoes:
            self.observacoes = self.observacoes.upper()

        # 🔧 Corrigir comparação com None
        if self.valor_pago is not None and self.valor_pago > 0:
            if self.valor_final is not None and self.valor_pago >= self.valor_final:
                self.status = 'paga'
                if not self.data_pagamento:
                    self.data_pagamento = date.today()
            else:
                self.status = 'paga_parcial'
        elif self.status == 'pendente' and self.data_vencimento and self.data_vencimento < date.today():
            self.status = 'vencida'

        super().save(*args, **kwargs)

    
    @property
    def valor_final(self):
        """Calcula: Valor Original - Desconto + Juros + Multa"""
        return self.valor_original - self.desconto + self.juros + self.multa
    
    @property
    def valor_restante(self):
        valor_final = Decimal(str(self.valor_final)) if self.valor_final else Decimal('0')
        valor_pago = Decimal(str(self.valor_pago)) if self.valor_pago else Decimal('0')
        
        return max(valor_final - valor_pago, Decimal('0'))
    
    @property
    def esta_vencida(self):
        """Verifica se a conta está vencida"""
        return self.status == 'pendente' and self.data_vencimento < date.today()
    
    @property
    def percentual_pago(self):
        """Retorna o percentual pago"""
        if self.valor_final > 0:
            return (self.valor_pago / self.valor_final) * 100
        return 0