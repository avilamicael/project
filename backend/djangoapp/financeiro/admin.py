from django.contrib import admin
from django.shortcuts import render, redirect
from django.urls import path
from django.http import HttpResponse
from django.contrib import messages
from django.utils.html import format_html
import csv
import io
from datetime import datetime
from decimal import Decimal
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
    change_list_template = 'admin/financeiro/contaspagar/change_list.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('importar/', self.admin_site.admin_view(self.importar_contas), name='financeiro_contaspagar_importar'),
            path('baixar-modelo/', self.admin_site.admin_view(self.baixar_modelo_csv), name='financeiro_contaspagar_modelo'),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        """Adiciona links customizados na listagem"""
        extra_context = extra_context or {}
        extra_context['importar_url'] = 'importar/'
        extra_context['modelo_url'] = 'baixar-modelo/'
        return super().changelist_view(request, extra_context=extra_context)

    def baixar_modelo_csv(self, request):
        """Gera um arquivo CSV de exemplo para importação"""
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="modelo_contas_pagar.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'descricao', 'filial_nome', 'filial_cnpj', 'fornecedor_nome', 'fornecedor_cpf_cnpj',
            'fornecedor_tipo_pessoa', 'categoria_nome', 'valor_original', 'desconto', 'juros', 'multa',
            'data_emissao', 'data_vencimento', 'data_pagamento', 'forma_pagamento_nome',
            'status', 'numero_boleto', 'notas_fiscais', 'observacoes',
            'criar_se_nao_existir'
        ])
        writer.writerow([
            'Exemplo - Pagamento de Serviço', 'Filial Principal', '12345678000190', 'Fornecedor XYZ', '98765432000100',
            'juridica', 'Serviços', '1000.00', '50.00', '0.00', '0.00',
            '2025-01-01', '2025-01-15', '', 'Boleto',
            'pendente', '12345678', 'NF-001', 'Observações opcionais',
            'sim'
        ])

        return response

    def importar_contas(self, request):
        """View para importar contas a pagar via CSV"""
        if request.method == 'POST':
            csv_file = request.FILES.get('csv_file')

            if not csv_file:
                messages.error(request, 'Por favor, selecione um arquivo CSV.')
                return redirect('..')

            if not csv_file.name.endswith('.csv'):
                messages.error(request, 'Por favor, faça upload de um arquivo CSV.')
                return redirect('..')

            try:
                # Ler arquivo CSV
                decoded_file = csv_file.read().decode('utf-8-sig')
                io_string = io.StringIO(decoded_file)
                reader = csv.DictReader(io_string)

                sucesso = 0
                erros = []
                user_company = request.user.company

                if not user_company:
                    messages.error(request, 'Usuário não possui empresa associada.')
                    return redirect('..')

                for row_num, row in enumerate(reader, start=2):
                    try:
                        # Verificar se deve criar entidades automaticamente (por linha)
                        criar_automatico = row.get('criar_se_nao_existir', '').lower() in ['sim', 'yes', 's', 'y', '1', 'true']
                        # Validar e buscar/criar filial
                        filial = None
                        if row.get('filial_nome'):
                            filial_nome = row['filial_nome'].strip()
                            filial = Filial.objects.filter(
                                nome__iexact=filial_nome,
                                company=user_company
                            ).first()

                            if not filial and criar_automatico:
                                # Obter CNPJ ou usar valor padrão
                                filial_cnpj = row.get('filial_cnpj', '').strip()
                                if not filial_cnpj:
                                    filial_cnpj = '00000000000000'  # CNPJ placeholder (14 dígitos)
                                else:
                                    # Remover formatação do CNPJ
                                    filial_cnpj = ''.join(filter(str.isdigit, filial_cnpj))
                                    if len(filial_cnpj) != 14:
                                        erros.append(f"Linha {row_num}: CNPJ da filial deve ter 14 dígitos")
                                        continue

                                try:
                                    filial = Filial.objects.create(
                                        company=user_company,
                                        nome=filial_nome,
                                        cnpj=filial_cnpj,
                                        ativa=True
                                    )
                                except Exception as e:
                                    erros.append(f"Linha {row_num}: Erro ao criar filial: {str(e)}")
                                    continue
                            elif not filial:
                                erros.append(f"Linha {row_num}: Filial '{filial_nome}' não encontrada")
                                continue

                        # Validar e buscar/criar fornecedor
                        fornecedor = None
                        if row.get('fornecedor_nome'):
                            fornecedor_nome = row['fornecedor_nome'].strip()
                            fornecedor = Fornecedor.objects.filter(
                                nome__iexact=fornecedor_nome,
                                company=user_company
                            ).first()

                            if not fornecedor and criar_automatico:
                                # Obter tipo de pessoa (padrão: jurídica)
                                tipo_pessoa = row.get('fornecedor_tipo_pessoa', 'juridica').strip().lower()
                                if tipo_pessoa not in ['fisica', 'juridica']:
                                    tipo_pessoa = 'juridica'

                                # Obter CPF/CNPJ (opcional para fornecedor)
                                cpf_cnpj = row.get('fornecedor_cpf_cnpj', '')
                                if cpf_cnpj:
                                    cpf_cnpj = cpf_cnpj.strip()
                                    cpf_cnpj = ''.join(filter(str.isdigit, cpf_cnpj))
                                    # Validar comprimento apenas se fornecido
                                    if cpf_cnpj:
                                        if tipo_pessoa == 'fisica' and len(cpf_cnpj) != 11:
                                            erros.append(f"Linha {row_num}: CPF deve ter 11 dígitos (fornecido: {len(cpf_cnpj)})")
                                            continue
                                        elif tipo_pessoa == 'juridica' and len(cpf_cnpj) != 14:
                                            erros.append(f"Linha {row_num}: CNPJ deve ter 14 dígitos (fornecido: {len(cpf_cnpj)})")
                                            continue
                                else:
                                    cpf_cnpj = ''

                                try:
                                    fornecedor = Fornecedor.objects.create(
                                        company=user_company,
                                        nome=fornecedor_nome,
                                        tipo_pessoa=tipo_pessoa,
                                        cpf_cnpj=cpf_cnpj if cpf_cnpj else '',
                                        ativo=True
                                    )
                                except Exception as e:
                                    erros.append(f"Linha {row_num}: Erro ao criar fornecedor: {str(e)}")
                                    continue
                            elif not fornecedor:
                                erros.append(f"Linha {row_num}: Fornecedor '{fornecedor_nome}' não encontrado")
                                continue

                        # Validar e buscar/criar categoria
                        categoria = None
                        if row.get('categoria_nome'):
                            categoria_nome = row['categoria_nome'].strip()
                            categoria = CategoriaFinanceira.objects.filter(
                                nome__iexact=categoria_nome,
                                company=user_company
                            ).first()

                            if not categoria and criar_automatico:
                                categoria = CategoriaFinanceira.objects.create(
                                    company=user_company,
                                    nome=categoria_nome,
                                    tipo='despesa',
                                    ativa=True
                                )
                            elif not categoria:
                                erros.append(f"Linha {row_num}: Categoria '{categoria_nome}' não encontrada")
                                continue

                        # Validar e buscar/criar forma de pagamento
                        forma_pagamento = None
                        if row.get('forma_pagamento_nome'):
                            forma_nome = row['forma_pagamento_nome'].strip()
                            forma_pagamento = FormaPagamento.objects.filter(
                                nome__iexact=forma_nome,
                                company=user_company
                            ).first()

                            if not forma_pagamento and criar_automatico:
                                forma_pagamento = FormaPagamento.objects.create(
                                    company=user_company,
                                    nome=forma_nome,
                                    ativa=True
                                )

                        # Converter valores
                        valor_original = Decimal(row.get('valor_original', '0').replace(',', '.'))
                        desconto = Decimal(row.get('desconto', '0').replace(',', '.')) if row.get('desconto') else None
                        juros = Decimal(row.get('juros', '0').replace(',', '.')) if row.get('juros') else None
                        multa = Decimal(row.get('multa', '0').replace(',', '.')) if row.get('multa') else None

                        # Converter datas
                        data_emissao = None
                        if row.get('data_emissao'):
                            data_emissao = datetime.strptime(row['data_emissao'], '%Y-%m-%d').date()

                        data_vencimento = datetime.strptime(row['data_vencimento'], '%Y-%m-%d').date()

                        data_pagamento = None
                        if row.get('data_pagamento'):
                            data_pagamento = datetime.strptime(row['data_pagamento'], '%Y-%m-%d').date()

                        # Calcular valor_pago se a conta estiver paga
                        valor_pago = None
                        if row.get('status') == 'paga' or data_pagamento:
                            # Se não especificou valor pago, usar o valor final (original - desconto + juros + multa)
                            valor_pago = valor_original
                            if desconto:
                                valor_pago -= desconto
                            if juros:
                                valor_pago += juros
                            if multa:
                                valor_pago += multa

                        if valor_pago is None:
                            valor_pago = Decimal('0')

                        # Criar conta
                        ContasPagar.objects.create(
                            company=user_company,
                            descricao=row['descricao'],
                            filial=filial,
                            fornecedor=fornecedor,
                            categoria=categoria,
                            valor_original=valor_original,
                            desconto=desconto,
                            juros=juros,
                            multa=multa,
                            data_emissao=data_emissao,
                            data_vencimento=data_vencimento,
                            data_pagamento=data_pagamento,
                            valor_pago=valor_pago,
                            forma_pagamento=forma_pagamento,
                            status=row.get('status', 'pendente'),
                            numero_boleto=row.get('numero_boleto'),
                            notas_fiscais=row.get('notas_fiscais'),
                            observacoes=row.get('observacoes'),
                            created_by=request.user,
                            updated_by=request.user
                        )
                        sucesso += 1

                    except Exception as e:
                        erros.append(f"Linha {row_num}: {str(e)}")

                # Mensagens de resultado
                if sucesso > 0:
                    messages.success(request, f'{sucesso} conta(s) importada(s) com sucesso!')

                if erros:
                    messages.warning(request, f'{len(erros)} erro(s) encontrado(s):')
                    for erro in erros[:10]:  # Mostrar apenas os primeiros 10 erros
                        messages.error(request, erro)
                    if len(erros) > 10:
                        messages.error(request, f'... e mais {len(erros) - 10} erro(s).')

                return redirect('..')

            except Exception as e:
                messages.error(request, f'Erro ao processar arquivo: {str(e)}')
                return redirect('..')

        # GET request - mostrar formulário
        context = {
            'title': 'Importar Contas a Pagar',
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request),
        }
        return render(request, 'admin/financeiro/importar_contas.html', context)