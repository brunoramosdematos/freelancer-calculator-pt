export const languageName = "Português (Brasil)";

export const metadata = {
  title: "Calculadora para Freelancers em Portugal | IRS e Segurança Social",
  description:
    "Calculadora de código aberto para estimar a renda líquida, o IRS português e as contribuições à Segurança Social de Portugal para trabalhadores independentes, incluindo tributação individual, tributação conjunta com uma única renda e deduções por dependentes.",
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
    appearance: "Aparência",
  },
  theme: {
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
    systemDescription: "Segue a preferência de aparência do dispositivo.",
  },
  actions: {
    reset: "redefinir",
    share: "compartilhar",
    save: "salvar",
    simulationActionsLabel: "Ações da simulação",
    auto: "auto",
    close: "Fechar",
    closeModal: "Fechar janela",
    saveSimulation: "Salvar esta simulação",
    saveNewSimulation: "Salvar",
    viewRanks: "Ver escalões",
    viewSocialSecurityCalculation: "Ver cálculo da Segurança Social",
    goToSimulator: "ir para o simulador",
    contributeOnGitHub: "contribuir no GitHub",
    officialInformation: "Informação oficial",
    openSimulation: "Abrir simulação salva",
    deleteSimulation: "Excluir simulação salva",
  },
  frequency: {
    year: "ano",
    month: "mês",
    day: "dia",
    Year: "Ano",
    Month: "Mês",
    Day: "Dia",
    compare: "Comparar ano, mês e dia",
    showIncomePer: "Mostrar renda por",
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
    tagline: "simule sua renda líquida",
    incomePlaceholder: "Renda",
    increaseIncome: "Aumentar renda em {amount}",
    decreaseIncome: "Diminuir renda em {amount}",
    shareCopied: "link compartilhável copiado para a área de transferência",
    simulationSaved: "Simulação salva",
  },
  simulationSettings: {
    title: "Configurações da simulação",
    summary: "Premissas principais usadas na estimativa.",
    infoLabel: "Informação sobre o ano fiscal",
    infoText:
      "Os anos fiscais podem alterar valores do IAS e escalões de IRS. O ano selecionado controla esses limites publicados.",
    taxYear: "Ano fiscal",
  },
  assessment: {
    label: "Forma de tributação",
    individual: {
      label: "Individual",
      description:
        "Um sujeito passivo; sem cônjuge ou união de facto incluídos.",
    },
    jointSingleIncome: {
      label: "Conjunta — uma renda",
      description: "Tributação do agregado com uma renda de EUR 0.",
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
      help: "As idades são medidas em 31 de dezembro do ano fiscal selecionado. As faixas etárias afetam a dedução por dependentes usada por este simulador.",
      aged3OrUnder: {
        label: "Até 3 anos",
        input: "Até 3 anos",
        decrease: "Diminuir dependentes até 3 anos",
        increase: "Aumentar dependentes até 3 anos",
      },
      aged4To6: {
        label: "De 4 a 6 anos",
        input: "De 4 a 6 anos",
        decrease: "Diminuir dependentes de 4 a 6 anos",
        increase: "Aumentar dependentes de 4 a 6 anos",
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
        "O dependente é considerado como tendo 7 anos ou mais. | Os {total} dependentes são considerados como tendo 7 anos ou mais.",
      aged3OrUnderSegment: "{count} até 3 anos | {count} até 3 anos",
      aged4To6Segment: "{count} de 4 a 6 anos | {count} de 4 a 6 anos",
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
      label: "Dias de folga não remunerados",
      decrease: "Diminuir dias de folga não remunerados",
      increase: "Aumentar dias de folga não remunerados",
    },
  },
  advancedSettings: {
    title: "Configurações fiscais avançadas",
    noCustomSettings: "Sem configurações fiscais personalizadas",
    socialSecurityBaseAdjustment: {
      label: "Ajuste da base da Segurança Social",
      infoLabel: "Informação sobre o ajuste da base da Segurança Social",
      infoText:
        "A porcentagem selecionada aplica-se à base de renda relevante de 70% antes da taxa de 21,4%. Limites, mínimos e isenções podem impedir uma alteração visível na contribuição final à Segurança Social de Portugal.",
      decrease: "Diminuir ajuste da base da Segurança Social",
      increase: "Aumentar ajuste da base da Segurança Social",
    },
    youthIrs: {
      label: "IRS Jovem",
      infoLabel: "Informação sobre o IRS Jovem",
      infoText:
        "O IRS Jovem pode reduzir o IRS de contribuintes elegíveis conforme as regras anuais aplicáveis.",
      year: "Ano",
      summary: "IRS Jovem ano {year}",
    },
    socialSecurityExemption: {
      label: "Isenção de SS nos primeiros 12 meses",
      infoLabel:
        "Informação sobre a isenção de Segurança Social nos primeiros 12 meses",
      infoText:
        "Os primeiros 12 meses como trabalhador independente podem estar isentos de contribuições à Segurança Social de Portugal.",
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
        "Residentes não habituais usam uma taxa fixa de IRS de {rate} neste simulador.",
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
      "A isenção de Segurança Social está ativa; este ajuste não tem efeito monetário no momento.",
    exemptionFinalZero:
      "A isenção de Segurança Social está ativa; a Segurança Social final é EUR 0.",
    minimumApplied:
      "Contribuição mínima mensal para a Segurança Social aplicada.",
    cappedWithBase: "Base máxima da Segurança Social aplicada · {base}/mês.",
    cappedWithFirstChangingAdjustment:
      "Base máxima da Segurança Social aplicada · {base}/mês. {percentage} é o primeiro ajuste disponível que altera o resultado.",
    allAdjustmentsCapped:
      "Base contributiva máxima atingida. Todos os ajustes disponíveis produzem a mesma contribuição limitada para a Segurança Social.",
    cappedFirstChangingAdjustment:
      "Base contributiva máxima atingida. {percentage} é o primeiro ajuste disponível que altera o resultado.",
    noEffect:
      "Nenhum limite, mínimo ou isenção está alterando o resultado da Segurança Social.",
  },
  results: {
    title: "Resultados",
    shownPer: "Apresentado por {frequency}.",
    grossIncome: "Renda bruta",
    netIncome: "Renda líquida",
    totalTaxes: "Total de impostos",
  },
  table: {
    title: "Título",
    grossIncome: "Renda bruta",
    netIncome: "Renda líquida",
    socialSecurity: "Segurança Social",
  },
  scenarioComparison: {
    title: "Comparar cenários",
    summary:
      "Veja como a forma de tributação, a Segurança Social e os dependentes afetam a renda líquida.",
    explanation:
      "Adicione até três alternativas. A simulação ativa permanece inalterada enquanto cada cenário reutiliza o mesmo caminho de cálculo fiscal.",
    currentDescription: "Baseada nos valores atuais do simulador.",
    screenOnlyNote:
      "A comparação de cenários é apenas para análise na tela nesta versão.",
    presets: {
      individual: {
        label: "Comparar individual",
        description: "Usa tributação individual para a mesma renda.",
      },
      jointSingleIncome: {
        label: "Comparar conjunta — uma renda",
        description: "Usa tributação conjunta do agregado com uma renda.",
      },
      socialSecurityMinus20: {
        label: "Comparar SS -20%",
        description: "Aplica um ajuste de -20% à base da Segurança Social.",
      },
      noDependents: {
        label: "Comparar sem dependentes",
        description:
          "Redefine o número e as faixas etárias dos dependentes para zero.",
      },
    },
    table: {
      scenario: "Cenário",
      grossIncome: "Bruta / ano",
      irs: "IRS / ano",
      socialSecurity: "Segurança Social / ano",
      netIncomeYear: "Renda líquida / ano",
      netIncomeMonth: "Renda líquida / mês",
      difference: "Diferença",
      current: "Cenário atual",
      currentChip: "Atual",
      alternativeChip: "Alternativa",
      bestChip: "Melhor resultado",
      bestChipAriaLabel: "Melhor resultado por renda líquida anual",
      best: "Melhor renda líquida",
    },
    card: {
      annualNetIncome: "Renda líquida anual",
      monthlyNetIncome: "Renda líquida mensal",
      supportingMetrics: "Métricas de apoio",
      keyResult: "Resultado principal",
    },
    actions: {
      add: "Adicionar cenário",
      remove: "Remover",
      removeScenario: "Remover {scenario}",
      clearAll: "Limpar tudo",
    },
    statuses: {
      alreadyCurrent: "Já é o cenário atual",
      added: "Adicionado",
      limitReached: "Limite atingido",
      noAlternatives: "Ainda não há alternativas adicionadas.",
      alternativeCount:
        "{count} alternativa selecionada | {count} alternativas selecionadas",
      betterThanCurrent: "{amount} melhor que o cenário atual",
      worseThanCurrent: "{amount} pior que o cenário atual",
      sameAsCurrent: "Igual ao cenário atual",
    },
  },
  report: {
    actions: {
      export: "Exportar relatório",
      print: "Salvar como PDF",
      close: "Fechar",
    },
    title: "Relatório de renda",
    previewTitle: "Pré-visualização do relatório",
    previewDescription:
      "Revise a simulação atual antes de salvá-la como PDF pela janela de impressão do navegador.",
    generatedAt: "Gerado em",
    productionUrl: "URL de produção",
    summary: "Resumo executivo",
    assumptions: "Premissas",
    taxBreakdown: "Detalhamento fiscal",
    fiscalData: "Dados fiscais",
    disclaimer: "Aviso legal",
    disclaimerText:
      "Estes cálculos são estimativas para trabalhadores independentes com recibos verdes. Eles não são aconselhamento contábil, jurídico ou fiscal. O IVA está excluído conforme as premissas do simulador. Verifique sua situação com fontes oficiais ou um profissional qualificado.",
    currentUrl: "URL atual do simulador",
    noIncome: "Não há relatório disponível sem uma renda válida.",
    printUnavailable:
      "O navegador não disponibiliza a janela de impressão neste contexto.",
    table: {
      item: "Item",
      value: "Valor",
    },
    rows: {
      grossIncome: "Renda bruta anual",
      netIncome: "Renda líquida anual",
      totalTaxes: "Total anual de impostos",
      irs: "IRS anual",
      socialSecurity: "Segurança Social anual",
      finalIrs: "IRS final",
      dependentDeduction: "Dedução por dependentes aplicada",
      paidMonths: "Meses pagos por ano",
      unpaidDays: "Dias de férias não pagos",
      taxAssessment: "Tributação",
      incomeFrequency: "Frequência da renda",
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
    title: "Gráfico da distribuição da renda",
    summary: "Divisão visual entre renda líquida, IRS e Segurança Social",
    loading: "Carregando o gráfico da distribuição da renda...",
    grossIncome: "renda bruta",
    grossIncomeLabel: "Renda bruta",
    netIncome: "Renda líquida",
    socialSecurity: "Segurança Social",
    ariaLabel:
      "Gráfico da distribuição da renda entre renda líquida, IRS e Segurança Social.",
  },
  calculationDetails: {
    title: "Detalhes do cálculo",
    summary: "IRS, Segurança Social, deduções e premissas",
    irsTitle: "Cálculo do IRS",
    irsSummary: "Renda coletável, escalões e deduções por dependentes",
    socialSecurityTitle: "Cálculo da Segurança Social",
    socialSecuritySummary: "Base de 70%, ajuste, limite e contribuição final",
    deductionsTitle: "Deduções e premissas",
    deductionsSummary: "Despesas, benefícios e premissas de dias úteis",
  },
  irsCalculation: {
    specificDeductions: "Deduções específicas",
    expenses: "Despesas",
    youthIrsDiscount: "Desconto do IRS Jovem",
    householdTaxableIncome: "Renda coletável do agregado",
    taxableIncomeForRates: "Renda coletável usada para taxas de IRS",
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
        "A renda coletável usada para taxas de IRS ({amount}) está no nível {level}.",
      biggerThan: "maior que {amount}",
      lowerThan: "menor que {amount}",
      and: "e",
      level: "Nível",
      minimum: "Mínimo",
      maximum: "Máximo",
      normalTax: "Taxa normal",
      averageTax: "Taxa média",
    },
  },
  socialSecurityCalculation: {
    relevantIncome: "Renda relevante a 70%",
    selectedAdjustment: "Ajuste selecionado",
    adjustedRelevantIncome: "Renda relevante ajustada",
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
    unpaidDays: "Dias de folga não remunerados",
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
      summary: "{status} · revisado em {date}",
      latestSupported: "ano mais recente suportado",
      historicalSupported: "ano histórico suportado",
      unsupported: "ano fiscal não suportado",
      coverageCurrent:
        "A cobertura dos dados fiscais está atualizada para os anos suportados.",
      reviewRequired:
        "Podem existir dados fiscais mais recentes depois de {year}. Revisão necessária.",
      reviewedAt: "revisado em {date}",
      latestYear: "Ano mais recente suportado",
      selectedYear: "Ano fiscal selecionado",
      supportedYears: "Anos fiscais suportados",
      lastReviewed: "Última revisão",
      estimateDisclaimer:
        "Os cálculos continuam sendo estimativas e não substituem aconselhamento contábil, jurídico ou fiscal.",
      sourceReferences: "Referências das fontes",
      viewSources: "Ver fontes",
      officialSources: "Fontes oficiais",
      internalPolicy: "Política interna de atualização fiscal",
      detailsLabel: "Ver cobertura e fontes dos dados fiscais para {year}",
      supportMeaning:
        "Suportado significa que este simulador inclui escalões de IRS, valores do IAS, metadados do IRS Jovem, premissas da Segurança Social e deduções relacionadas para os anos listados.",
    },
    about: {
      title: "Cobertura dos dados fiscais",
      description:
        "O aplicativo distribui metadados fiscais estáticos e versionados. Ele não coleta dados dos portais oficiais em tempo de execução.",
      supportedYears: "Anos fiscais suportados",
      latestSupportedYear: "Ano fiscal mais recente suportado",
      lastReviewed: "Última revisão",
      sources: "Fontes",
      limitations:
        "Cobertura significa que o simulador inclui escalões de IRS, valores do IAS, metadados do IRS Jovem, premissas da Segurança Social e deduções relacionadas para os anos listados. O resultado continua sendo uma estimativa, e o usuário deve validar sua situação com fontes oficiais ou um profissional qualificado.",
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
        "Os links das fontes apontam para portais oficiais e para a política de atualização fiscal do repositório; as referências legais exatas são revisadas durante atualizações dos dados fiscais.",
    },
  },
  simulations: {
    title: "Simulações salvas",
    empty: "Ainda não há simulações salvas.",
    namePlaceholder: "Nome da simulação",
  },
  about: {
    title: "Calculadora para Freelancers em Portugal",
    intro:
      "Esta calculadora de código aberto estima a renda líquida, o IRS português e a Segurança Social de Portugal para trabalhadores independentes usando o modelo simplificado da Categoria B implementado no simulador. Ela oferece suporte à tributação individual, tributação conjunta com uma única renda, deduções por dependentes e simulações salvas no localStorage do navegador.",
    maintained:
      "O projeto é mantido por Bruno Ramos de Matos como derivado do trabalho de código aberto original de Francisco Macedo:",
    disclaimer:
      "Os cálculos são estimativas indicativas, não aconselhamento contábil, jurídico ou fiscal. Eles não cobrem todas as regras fiscais portuguesas, como guarda compartilhada, deduções por deficiência, regras de mínimo de existência, deduções adicionais à coleta ou a taxa adicional de solidariedade. Valide sua situação com a Autoridade Tributária e Aduaneira ou um profissional qualificado.",
  },
  footer: {
    headline:
      "Estimativa indicativa · {businessDays} dias úteis · IVA excluído",
    assumptionsTitle: "Premissas e limitações",
    independentWorkers:
      "Esta estimativa destina-se a trabalhadores independentes com recibos verdes.",
    vatIgnored:
      "O IVA é ignorado no cenário em que os clientes estão fora de Portugal.",
    dailyValues:
      "Os valores diários usam {businessDays} dias úteis menos os dias de folga não remunerados.",
    aboutDisclaimer: "Sobre e aviso legal",
  },
  accessibility: {
    decreaseValue: "Diminuir valor",
    increaseValue: "Aumentar valor",
    counterValue: "Valor do contador",
    moreInformation: "Mais informações",
  },
  validation: {
    noValue: "-",
  },
} as const;

export default messages;
