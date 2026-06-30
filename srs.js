// Algoritmo de repetição espaçada (SM-2 simplificado, mesmo princípio do Anki)
// Qualidade da resposta: 0 = errei, 1 = difícil mas acertei, 2 = fácil

function scheduleCard(card, quality) {
  let { repetitions, easeFactor, interval } = card;

  if (quality === 0) {
    // Errou: reseta o progresso, mas mantém o ease factor
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Ajusta o ease factor conforme a dificuldade
    if (quality === 1) {
      easeFactor = Math.max(1.3, easeFactor - 0.15); // ficou mais difícil
    } else if (quality === 2) {
      easeFactor = easeFactor + 0.1; // ficou mais fácil
    }
  }

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    ...card,
    repetitions,
    easeFactor,
    interval,
    nextReview
  };
}

function getDueCards(cards) {
  const now = Date.now();
  return Object.values(cards).filter(c => c.nextReview <= now);
}

function getUpcomingCards(cards) {
  const now = Date.now();
  return Object.values(cards)
    .filter(c => c.nextReview > now)
    .sort((a, b) => a.nextReview - b.nextReview);
}

function daysUntil(timestamp) {
  const diff = timestamp - Date.now();
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'hoje';
  if (days === 1) return 'amanhã';
  return `em ${days} dias`;
}
