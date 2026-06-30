export const languageName = "Português (Portugal)";

export const metadata = {
  title: "Calculadora para Freelancers em Portugal | IRS e Segurança Social",
  description:
    "Calculadora open source para estimar o rendimento líquido, o IRS português e as contribuições para a Segurança Social de trabalhadores independentes, incluindo tributação individual, tributação conjunta com um único rendimento e deduções por dependentes.",
} as const;

const messages = {
  app: {
    productHeading: "Calculadora para Freelancers em Portugal 🇵🇹",
    productAlt: "Calculadora para Freelancers em Portugal",
  },
  navigation: {
    simulator: "simulador",
    simulations: "simulação ({count}) | simulações ({count})",
    about: "sobre",
    githubSourceLabel:
      "Abrir o código-fonte da Calculadora para Freelancers em Portugal no GitHub",
  },
  localeSwitcher: {
    label: "Idioma",
    english: "English",
    portuguesePortugal: "Português (Portugal)",
    portugueseBrazil: "Português (Brasil)",
  },
  preferences: {
    title: "Preferências",
    open: "Abrir preferências",
    close: "Fechar preferências",
    language: "Idioma",
    appearance: "Aspeto",
  },
  theme: {
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
    systemDescription: "Segue a preferência de aspeto do dispositivo.",
  },
  actions: {
    reset: "repor",
    share: "partilhar",
    save: "guardar",
    simulationActionsLabel: "Ações da simulação",
    auto: "auto",
    close: "Fechar",
    closeModal: "Fechar janela",
    saveSimulation: "Guardar esta simulação",
    saveNewSimulation: "Guardar",
    viewRanks: "Ver escalões",
    viewSocialSecurityCalculation: "Ver cálculo da Segurança Social",
    goToSimulator: "ir para o simulador",
    contributeOnGitHub: "contribuir no GitHub",
    officialInformation: "Informação oficial",
    openSimulation: "Abrir simulação guardada",
    deleteSimulation: "Eliminar simulação guardada",
  },
  frequency: {
    year: "ano",
    month: "mês",
    day: "dia",
    Year: "Ano",
    Month: "Mês",
    Day: "Dia",
    compare: "Comparar ano, mês e dia",
    showIncomePer: "Mostrar rendimento por",
  },
  units: {
    dependents: "{count} dependente | {count} dependentes",
    dependentUnit: "dependente | dependentes",
    months: "{count} mês | {count} meses",
    monthUnit: "mês | meses",
    days: "{count} dia | {count} dias",
    dayUnit: "dia | dias",
    eur: "EUR",
    perYear: "/ano",
    perMonth: "/mês",
    businessDays: "dias úteis",
    vatExcluded: "IVA excluído",
  },
  simulator: {
    tagline: "simule o seu rendimento líquido",
    incomePlaceholder: "Rendimento",
    increaseIncome: "Aumentar rendimento em {amount}",
    decreaseIncome: "Diminuir rendimento em {amount}",
    shareCopied: "ligação partilhável copiada para a área de transferência",
    simulationSaved: "Simulação guardada",
  },
  simulationSettings: {
    title: "Definições da simulação",
    summary: "Pressupostos principais usados na estimativa.",
    infoLabel: "Informação sobre o ano fiscal",
    infoText:
      "Os anos fiscais podem alterar valores do IAS e escalões de IRS. O ano selecionado controla esses limites publicados.",
    taxYear: "Ano fiscal",
  },
  assessment: {
    label: "Tributação",
    individual: {
      label: "Individual",
      description:
        "Um sujeito passivo; sem cônjuge ou unido de facto incluído.",
    },
    jointSingleIncome: {
      label: "Conjunta — um rendimento",
      description: "Tributação do agregado com um rendimento de EUR 0.",
      help: "Usa o quociente conjugal para os escalões de IRS.",
    },
  },
  dependents: {
    total: {
      label: "Número de dependentes",
      input: "Número de dependentes",
      decrease: "Diminuir número de dependentes",
      increase: "Aumentar número de dependentes",
    },
    ageGroups: {
      title: "Faixas etárias dos dependentes",
      help: "As idades são medidas a 31 de dezembro do ano fiscal selecionado. As faixas etárias afetam a dedução por dependentes usada por este simulador.",
      aged3OrUnder: {
        label: "Até 3 anos",
        input: "Até 3 anos",
        decrease: "Diminuir dependentes até 3 anos",
        increase: "Aumentar dependentes até 3 anos",
      },
      aged4To6: {
        label: "Dos 4 aos 6 anos",
        input: "Dos 4 aos 6 anos",
        decrease: "Diminuir dependentes dos 4 aos 6 anos",
        increase: "Aumentar dependentes dos 4 aos 6 anos",
      },
      aged7OrOver: {
        label: "7 anos ou mais",
        outputLabel: "7 anos ou mais",
        calculated: "Calculado automaticamente",
      },
    },
    summary: {
      none: "Sem dependentes.",
      allOlder:
        "O dependente é atualmente considerado como tendo 7 anos ou mais. | Os {total} dependentes são atualmente considerados como tendo 7 anos ou mais.",
      aged3OrUnderSegment: "{count} até 3 anos | {count} até 3 anos",
      aged4To6Segment: "{count} dos 4 aos 6 anos | {count} dos 4 aos 6 anos",
      aged7OrOverSegment:
        "{count} com 7 anos ou mais | {count} com 7 anos ou mais",
    },
  },
  schedule: {
    paidMonths: {
      label: "Meses remunerados por ano",
      decrease: "Diminuir meses remunerados por ano",
      increase: "Aumentar meses remunerados por ano",
    },
    unpaidDays: {
      label: "Dias de ausência não remunerados",
      decrease: "Diminuir dias de ausência não remunerados",
      increase: "Aumentar dias de ausência não remunerados",
    },
  },
  advancedSettings: {
    title: "Opções fiscais avançadas",
    noCustomSettings: "Sem opções fiscais personalizadas",
    socialSecurityBaseAdjustment: {
      label: "Ajuste da base da Segurança Social",
      infoLabel: "Informação sobre o ajuste da base da Segurança Social",
      infoText:
        "A percentagem selecionada aplica-se à base de rendimento relevante de 70% antes da taxa de 21,4%. Limites, mínimos e isenções podem impedir uma alteração visível na contribuição final.",
      decrease: "Diminuir ajuste da base da Segurança Social",
      increase: "Aumentar ajuste da base da Segurança Social",
    },
    youthIrs: {
      label: "IRS Jovem",
      infoLabel: "Informação sobre o IRS Jovem",
      infoText:
        "O IRS Jovem pode reduzir o IRS de contribuintes elegíveis segundo as regras anuais aplicáveis.",
      year: "Ano",
      summary: "IRS Jovem ano {year}",
    },
    socialSecurityExemption: {
      label: "Isenção de SS nos primeiros 12 meses",
      infoLabel:
        "Informação sobre a isenção de Segurança Social nos primeiros 12 meses",
      infoText:
        "Os primeiros 12 meses como trabalhador independente podem estar isentos de contribuições para a Segurança Social.",
    },
    activityYear: {
      label: "Redução por ano de atividade",
      none: "Nenhuma",
      first: "Primeiro ano fiscal",
      second: "Segundo ano fiscal",
    },
    rnh: {
      label: "NHR / RNH",
      infoLabel: "Informação sobre NHR / RNH",
      infoText:
        "Os residentes não habituais usam uma taxa fixa de IRS de {rate} neste simulador.",
    },
    professionalExpenses: {
      title: "Despesas profissionais",
      infoLabel: "Informação sobre despesas profissionais",
      infoText:
        "As deduções específicas da Categoria B podem exigir despesas profissionais justificadas acima da dedução automática da Segurança Social.",
      maximumRequired: "Máximo necessário:",
      decrease: "Diminuir despesas profissionais",
      increase: "Aumentar despesas profissionais",
      manualSummary: "Despesas manuais",
    },
    summary: {
      ssBase: "Base SS {percentage}",
    },
  },
  socialSecurityStatus: {
    exemptionActive:
      "A isenção de Segurança Social está ativa; este ajuste não tem atualmente efeito monetário.",
    exemptionFinalZero:
      "A isenção de Segurança Social está ativa; a Segurança Social final é EUR 0.",
    minimumApplied:
      "Aplicada a contribuição mínima mensal para a Segurança Social.",
    cappedWithBase: "Base máxima da Segurança Social aplicada · {base}/mês.",
    cappedWithFirstChangingAdjustment:
      "Base máxima da Segurança Social aplicada · {base}/mês. {percentage} é o primeiro ajuste disponível que altera o resultado.",
    allAdjustmentsCapped:
      "Base contributiva máxima atingida. Todos os ajustes disponíveis produzem a mesma contribuição limitada para a Segurança Social.",
    cappedFirstChangingAdjustment:
      "Base contributiva máxima atingida. {percentage} é o primeiro ajuste disponível que altera o resultado.",
    noEffect:
      "Nenhum limite, mínimo ou isenção está a alterar o resultado da Segurança Social.",
  },
  results: {
    title: "Resultados",
    shownPer: "Apresentado por {frequency}.",
    grossIncome: "Rendimento bruto",
    netIncome: "Rendimento líquido",
    totalTaxes: "Total de impostos",
  },
  table: {
    title: "Título",
    grossIncome: "Rendimento bruto",
    netIncome: "Rendimento líquido",
    socialSecurity: "Segurança Social",
  },
  report: {
    actions: {
      export: "Exportar relatório",
      print: "Guardar como PDF",
      close: "Fechar",
    },
    title: "Relatório de rendimento",
    previewTitle: "Pré-visualização do relatório",
    previewDescription:
      "Revê a simulação atual antes de a guardares como PDF através da janela de impressão do navegador.",
    generatedAt: "Gerado em",
    productionUrl: "URL de produção",
    summary: "Resumo executivo",
    assumptions: "Premissas",
    taxBreakdown: "Detalhe fiscal",
    fiscalData: "Dados fiscais",
    disclaimer: "Aviso legal",
    disclaimerText:
      "Estes cálculos são estimativas para trabalhadores independentes com recibos verdes. Não constituem aconselhamento contabilístico, jurídico ou fiscal. O IVA está excluído de acordo com os pressupostos do simulador. Valida a tua situação com fontes oficiais ou um profissional qualificado.",
    currentUrl: "URL atual do simulador",
    noIncome: "Não há relatório disponível sem um rendimento válido.",
    printUnavailable:
      "O navegador não disponibiliza a janela de impressão neste contexto.",
    table: {
      item: "Item",
      value: "Valor",
    },
    rows: {
      grossIncome: "Rendimento bruto anual",
      netIncome: "Rendimento líquido anual",
      totalTaxes: "Total anual de impostos",
      irs: "IRS anual",
      socialSecurity: "Segurança Social anual",
      finalIrs: "IRS final",
      dependentDeduction: "Dedução por dependentes aplicada",
      paidMonths: "Meses pagos por ano",
      unpaidDays: "Dias de férias não pagos",
      taxAssessment: "Tributação",
      incomeFrequency: "Frequência do rendimento",
      displayFrequency: "Frequência apresentada selecionada",
      dependents: "Número de dependentes",
      dependentAgeGroups: "Faixas etárias dos dependentes",
      socialSecurityAdjustment: "Ajuste da Segurança Social",
      ssFirstYear: "Isenção de SS nos primeiros 12 meses",
      activityYear: "Redução por ano de atividade",
      youthIrs: "IRS Jovem",
      rnh: "RNH / NHR",
      expenses: "Despesas profissionais",
      taxYear: "Ano fiscal",
      latestSupportedYear: "Último ano suportado",
      lastReviewed: "Última revisão",
      irsBeforeDependentDeduction: "IRS antes da dedução por dependentes",
      socialSecurityContribution: "Contribuição para a Segurança Social",
      fiscalDataStatus: "Estado dos dados fiscais",
    },
    values: {
      yes: "Sim",
      no: "Não",
      notActive: "Inativo",
      dependentAgeGroups:
        "{aged3OrUnder} com 3 anos ou menos · {aged4To6} com 4–6 anos · {aged7OrOver} com 7+ anos",
      expensesSummary: "{mode} · {amount} · ainda necessário {stillNeeded}",
    },
  },
  chart: {
    title: "Gráfico da distribuição do rendimento",
    summary: "Divisão visual entre rendimento líquido, IRS e Segurança Social",
    loading: "A carregar o gráfico da distribuição do rendimento...",
    grossIncome: "rendimento bruto",
    grossIncomeLabel: "Rendimento bruto",
    netIncome: "Rendimento líquido",
    socialSecurity: "Segurança Social",
    ariaLabel:
      "Gráfico da distribuição do rendimento entre rendimento líquido, IRS e Segurança Social.",
  },
  calculationDetails: {
    title: "Detalhes do cálculo",
    summary: "IRS, Segurança Social, deduções e pressupostos",
    irsTitle: "Cálculo do IRS",
    irsSummary: "Rendimento coletável, escalões e deduções por dependentes",
    socialSecurityTitle: "Cálculo da Segurança Social",
    socialSecuritySummary: "Base de 70%, ajuste, limite e contribuição final",
    deductionsTitle: "Deduções e pressupostos",
    deductionsSummary: "Despesas, benefícios e pressupostos de dias úteis",
  },
  irsCalculation: {
    specificDeductions: "Deduções específicas",
    expenses: "Despesas",
    youthIrsDiscount: "Desconto do IRS Jovem",
    householdTaxableIncome: "Rendimento coletável do agregado",
    taxableIncomeForRates: "Rendimento coletável usado para taxas de IRS",
    dividedBy2: "(dividido por 2)",
    averageRatePortion: "Parcela à taxa média",
    normalRatePortion: "Parcela à taxa normal",
    quotient: "(quociente)",
    taxRank: "Escalão",
    levelOfTotal: "Nível {level} de {total}",
    irsBeforeDependentDeduction: "IRS antes da dedução por dependentes",
    dependentDeductionApplied: "Dedução por dependentes aplicada",
    finalIrs: "IRS final",
    dialog: {
      title: "Escalões",
      intro:
        "O rendimento coletável usado para taxas de IRS ({amount}) está no nível {level}.",
      biggerThan: "superior a {amount}",
      lowerThan: "inferior a {amount}",
      and: "e",
      level: "Nível",
      minimum: "Mínimo",
      maximum: "Máximo",
      normalTax: "Taxa normal",
      averageTax: "Taxa média",
    },
  },
  socialSecurityCalculation: {
    relevantIncome: "Rendimento relevante a 70%",
    selectedAdjustment: "Ajuste selecionado",
    adjustedRelevantIncome: "Rendimento relevante ajustado",
    maximumBase: "Base máxima de 12 IAS",
    contributionBase: "Base contributiva aplicada",
    calculatedMonthlyContribution: "Contribuição mensal calculada",
    finalMonthlyContribution: "Contribuição mensal final",
    annualFinalContribution: "Contribuição anual final",
    dailyFinalContribution: "Contribuição diária final",
    currentStatus: "Estado atual",
  },
  deductions: {
    professionalExpenses: "Despesas profissionais",
    expensesMode: "Modo das despesas",
    automatic: "Automático",
    manual: "Manual",
    expensesStillNeeded: "Despesas ainda necessárias",
    paidMonths: "Meses remunerados por ano",
    unpaidDays: "Dias de ausência não remunerados",
    businessDaysAssumed: "Dias úteis assumidos",
    youthIrs: "IRS Jovem",
    activityYearReduction: "Redução por ano de atividade",
    active: "Ativo",
    notActive: "Não ativo",
    activeYear: "Ativo, ano {year}",
    ssFirstYear: "Isenção de SS nos primeiros 12 meses",
  },
  taxData: {
    status: {
      title: "Dados fiscais",
      summary: "{status} · revisto em {date}",
      latestSupported: "ano mais recente suportado",
      historicalSupported: "ano histórico suportado",
      unsupported: "ano fiscal não suportado",
      coverageCurrent:
        "A cobertura dos dados fiscais está atualizada para os anos suportados.",
      reviewRequired:
        "Podem existir dados fiscais mais recentes depois de {year}. Revisão necessária.",
      reviewedAt: "revisto em {date}",
      latestYear: "Ano mais recente suportado",
      selectedYear: "Ano fiscal selecionado",
      supportedYears: "Anos fiscais suportados",
      lastReviewed: "Última revisão",
      estimateDisclaimer:
        "Os cálculos continuam a ser estimativas e não substituem aconselhamento contabilístico, jurídico ou fiscal.",
      sourceReferences: "Referências das fontes",
      viewSources: "Ver fontes",
      officialSources: "Fontes oficiais",
      internalPolicy: "Política interna de atualização fiscal",
      detailsLabel: "Ver cobertura e fontes dos dados fiscais para {year}",
      supportMeaning:
        "Suportado significa que este simulador inclui escalões de IRS, valores do IAS, metadados do IRS Jovem, pressupostos da Segurança Social e deduções relacionadas para os anos listados.",
    },
    about: {
      title: "Cobertura dos dados fiscais",
      description:
        "A aplicação distribui metadados fiscais estáticos e versionados. Não recolhe dados dos portais oficiais em tempo de execução.",
      supportedYears: "Anos fiscais suportados",
      latestSupportedYear: "Ano fiscal mais recente suportado",
      lastReviewed: "Última revisão",
      sources: "Fontes",
      limitations:
        "Cobertura significa que o simulador inclui escalões de IRS, valores do IAS, metadados do IRS Jovem, pressupostos da Segurança Social e deduções relacionadas para os anos listados. O resultado continua a ser uma estimativa, e o utilizador deve validar a sua situação com fontes oficiais ou um profissional qualificado.",
    },
    sources: {
      autoridadeTributaria: {
        label: "Autoridade Tributária e Aduaneira",
        publisher: "Portal das Finanças",
      },
      segurancaSocial: {
        label: "Segurança Social",
        publisher: "Segurança Social",
      },
      diarioRepublica: {
        label: "Diário da República",
        publisher: "Publicação oficial de legislação",
      },
      taxUpdatePolicy: {
        label: "Política de atualização fiscal",
        publisher: "Documentação interna do repositório",
      },
    },
    notes: {
      conservativeSourceReview:
        "As ligações das fontes apontam para portais oficiais e para a política de atualização fiscal do repositório; as referências legais exatas são revistas durante atualizações dos dados fiscais.",
    },
  },
  simulations: {
    title: "Simulações guardadas",
    empty: "Ainda não existem simulações guardadas.",
    namePlaceholder: "Nome da simulação",
  },
  about: {
    title: "Calculadora para Freelancers em Portugal",
    intro:
      "Esta calculadora open source estima o rendimento líquido, o IRS português e a Segurança Social de trabalhadores independentes usando o modelo simplificado da Categoria B implementado no simulador. Suporta tributação individual, tributação conjunta com um único rendimento, deduções por dependentes e simulações guardadas no localStorage do navegador.",
    maintained:
      "O projeto é mantido por Bruno Ramos de Matos como derivado do trabalho open source original de Francisco Macedo:",
    disclaimer:
      "Os cálculos são estimativas indicativas, não aconselhamento contabilístico, jurídico ou fiscal. Não cobrem todas as regras fiscais portuguesas, como guarda partilhada, deduções por deficiência, regras de mínimo de existência, deduções adicionais à coleta ou a taxa adicional de solidariedade. Valide a sua situação com a Autoridade Tributária e Aduaneira ou um profissional qualificado.",
  },
  footer: {
    headline:
      "Estimativa indicativa · {businessDays} dias úteis · IVA excluído",
    assumptionsTitle: "Pressupostos e limitações",
    independentWorkers:
      "Esta estimativa destina-se a trabalhadores independentes com recibos verdes.",
    vatIgnored:
      "O IVA é ignorado no cenário em que os clientes estão fora de Portugal.",
    dailyValues:
      "Os valores diários usam {businessDays} dias úteis menos os dias de ausência não remunerados.",
    aboutDisclaimer: "Sobre e aviso legal",
  },
  accessibility: {
    decreaseValue: "Diminuir valor",
    increaseValue: "Aumentar valor",
    counterValue: "Valor do contador",
    moreInformation: "Mais informação",
  },
  validation: {
    noValue: "-",
  },
} as const;

export default messages;
