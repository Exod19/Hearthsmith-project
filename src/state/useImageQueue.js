// =============================================================
//  useImageQueue.js — File d'attente de génération d'images
// -------------------------------------------------------------
//  Les photos se génèrent une à une en arrière-plan ; on peut
//  continuer à utiliser l'app pendant ce temps.
// =============================================================

import { useCallback, useRef, useState } from 'react';
import { generateMealImage, getImageSettings } from '../utils/imageGen.js';

export function useImageQueue({ setImage, notify }) {
  const [status, setStatus] = useState(null); // { done, total, current }
  const queue = useRef([]);
  const running = useRef(false);
  const counts = useRef({ done: 0, total: 0, failed: 0 });

  const run = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    while (queue.current.length) {
      const meal = queue.current.shift();
      setStatus({ ...counts.current, current: meal.name });
      try {
        setImage(meal.id, await generateMealImage(meal));
      } catch (error) {
        counts.current.failed += 1;
        notify(`Image de « ${meal.name} » : ${error.message}`, { tone: 'error' });
        // Erreur de configuration (clé, compte) : inutile d'insister pour les suivantes.
        if (/clé|key|vérifier|401|403/i.test(error.message)) queue.current = [];
      }
      counts.current.done += 1;
    }
    const { done, failed } = counts.current;
    if (done - failed > 0) notify(done - failed > 1 ? `${done - failed} images générées` : 'Image générée');
    counts.current = { done: 0, total: 0, failed: 0 };
    running.current = false;
    setStatus(null);
  }, [setImage, notify]);

  /** Ajoute des recettes à la file. Renvoie false si la génération est désactivée. */
  const enqueue = useCallback(
    (meals) => {
      const list = meals.filter((m) => m?.name);
      if (!list.length || getImageSettings().provider === 'off') return false;
      queue.current.push(...list);
      counts.current.total += list.length;
      setStatus({ ...counts.current, current: list[0].name });
      run();
      return true;
    },
    [run]
  );

  return { enqueue, status };
}
