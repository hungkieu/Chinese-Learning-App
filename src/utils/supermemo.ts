export const updateCardSM2 = (card, quality) => {
  let ef = card.ef || 2.5;
  let repetition = card.repetition || 0;
  let interval = card.interval || 0;

  if (quality < 3) {
    repetition = 0;
    interval = 0;
  } else {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetition += 1;
  }

  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    ...card,
    ef,
    repetition,
    interval,
    dueDate: dueDate.toISOString().split("T")[0],
  };
};
