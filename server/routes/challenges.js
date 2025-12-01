const express = require('express');
const { authenticate } = require('../auth/middleware');
const { sql } = require('../db');

const router = express.Router();

/**
 * Get current seasonal theme based on date
 */
const getSeasonalTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // New Year (Dec 31 - Jan 2)
  if ((month === 12 && day >= 31) || (month === 1 && day <= 2)) {
    return {
      name: 'newyear',
      emoji: '🎉',
      themes: {
        speed: ['🎆 Velocidad de Año Nuevo', '🥂 Brindis Rápido', '🕛 Cuenta Regresiva Express'],
        accuracy: ['🎯 Propósitos Precisos', '✨ Comienzo Perfecto', '🥂 Brindis sin Errores'],
        consistency: ['📅 Primer Hábito del Año', '🎉 Constancia de Año Nuevo', '🕛 Dedicación desde el Día 1'],
        improvement: ['🚀 Despegue de Año Nuevo', '📈 Metas de Enero', '✨ Nuevo Año, Nuevo Nivel'],
        exploration: ['🗺️ Explora el Nuevo Año', '🎉 Descubre Nuevos Retos', '🥂 Aventura de Enero']
      }
    };
  }

  // Three Kings Day (Jan 5-7)
  if (month === 1 && day >= 5 && day <= 7) {
    return {
      name: 'threekings',
      emoji: '👑',
      themes: {
        speed: ['👑 Velocidad Real', '⭐ Rápido como Melchor', '🐪 Galope de Camello'],
        accuracy: ['💎 Precisión de Oro', '✨ Perfección de Incienso', '👑 Exactitud de Mirra'],
        consistency: ['🌟 Constancia de los Magos', '🎁 Práctica Real', '👑 Dedicación de Reyes'],
        improvement: ['🎁 Regalo de los Reyes', '⭐ Mejora Mágica', '👑 Entrenamiento Real'],
        exploration: ['🐪 Travesía de Oriente', '⭐ Siguiendo la Estrella', '🏜️ Ruta de los Magos']
      }
    };
  }

  // Carnival (Feb - approx dates, using broad range Feb 10-25)
  if (month === 2 && day >= 10 && day <= 25) {
    return {
      name: 'carnival',
      emoji: '🎭',
      themes: {
        speed: ['🎭 Velocidad de Carnaval', '🥁 Ritmo Rápido', '💃 Baile de Teclas'],
        accuracy: ['🎭 Precisión de Máscara', '✨ Disfraz Perfecto', '🥁 Ritmo Exacto'],
        consistency: ['💃 Constancia Festiva', '🎭 Práctica de Carnaval', '🥁 Dedicación Rítmica'],
        improvement: ['🎭 Mejora tu Disfraz', '💃 Pasos de Progreso', '🥁 Entrenamiento Festivo'],
        exploration: ['🎭 Desfile de Modos', '💃 Explora el Ritmo', '🥁 Aventura de Carnaval']
      }
    };
  }

  // Valentine's Day (Feb 13-15)
  if (month === 2 && day >= 13 && day <= 15) {
    return {
      name: 'valentine',
      emoji: '💝',
      themes: {
        speed: ['💘 Velocidad del Amor', '💝 Rápido como Cupido', '💌 Mensaje Express'],
        accuracy: ['💖 Precisión del Corazón', '💝 Perfección Romántica', '💕 Exactitud Amorosa'],
        consistency: ['💗 Constancia en el Amor', '💝 Práctica con Cariño', '💖 Dedicación Romántica'],
        improvement: ['💝 Regalo de Amor', '💘 Mejora tu Corazón', '💖 Entrenamiento Romántico'],
        exploration: ['💌 Aventura Romántica', '💘 Descubre el Amor', '💝 Ruta del Corazón']
      }
    };
  }

  // Earth Day (Apr 20-23)
  if (month === 4 && day >= 20 && day <= 23) {
    return {
      name: 'earthday',
      emoji: '🌍',
      themes: {
        speed: ['🍃 Velocidad Natural', '🌍 Rápido por el Planeta', '♻️ Reciclaje Express'],
        accuracy: ['🌱 Precisión Ecológica', '🌍 Perfección Verde', '🍃 Exactitud Natural'],
        consistency: ['🌳 Constancia Sostenible', '🌍 Práctica por la Tierra', '🌱 Dedicación Verde'],
        improvement: ['🌍 Mejora tu Huella', '🌱 Crecimiento Natural', '♻️ Progreso Sostenible'],
        exploration: ['🌳 Explora la Naturaleza', '🌍 Descubre el Planeta', '🍃 Ruta Ecológica']
      }
    };
  }

  // Star Wars Day (May 4-5)
  if (month === 5 && (day === 4 || day === 5)) {
    return {
      name: 'starwars',
      emoji: '⚔️',
      themes: {
        speed: ['🚀 Velocidad Luz', '⚔️ Rápido como un Jedi', '🌌 Carrera de Vainas'],
        accuracy: ['🎯 Puntería de Stormtrooper (Mejorada)', '⚔️ Precisión de la Fuerza', '🤖 Perfección Droide'],
        consistency: ['🌌 Constancia de la Fuerza', '⚔️ Práctica Jedi', '🧘 Dedicación Padawan'],
        improvement: ['⚔️ Entrenamiento Jedi', '🚀 Ascenso al Lado Luminoso', '🌌 Progreso Galáctico'],
        exploration: ['🌌 Explora la Galaxia', '⚔️ Descubre la Fuerza', '🚀 Misión Espacial']
      }
    };
  }

  // Summer (Jun 21 - Sep 22)
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 10)) {
    return {
      name: 'summer',
      emoji: '☀️',
      themes: {
        speed: ['🏖️ Velocidad Playera', '🌊 Rápido como una Ola', '☀️ Velocidad Solar'],
        accuracy: ['🌴 Precisión Tropical', '🏝️ Perfección de Playa', '☀️ Exactitud Veraniega'],
        consistency: ['🌊 Constancia de Verano', '🏖️ Práctica bajo el Sol', '☀️ Dedicación Estival'],
        improvement: ['🏄 Surf de Mejora', '🌊 Ola de Progreso', '☀️ Entrenamiento Solar'],
        exploration: ['🏝️ Aventura Tropical', '🌊 Descubre el Mar', '🏖️ Ruta Playera']
      }
    };
  }

  // Back to School (Sep 1 - Sep 15) - Overrides Summer
  if (month === 9 && day >= 1 && day <= 15) {
    return {
      name: 'backtoschool',
      emoji: '🎒',
      themes: {
        speed: ['✏️ Velocidad de Apuntes', '🎒 Rápido al Cole', '🚌 Bus Escolar Express'],
        accuracy: ['📝 Precisión de Examen', '📚 Perfección Académica', '✏️ Exactitud de Tarea'],
        consistency: ['📅 Constancia de Estudio', '🎒 Práctica Diaria', '📚 Dedicación Escolar'],
        improvement: ['📈 Mejora tus Notas', '🎓 Progreso Académico', '✏️ Entrenamiento de Clase'],
        exploration: ['🔬 Explora Nuevas Materias', '📚 Descubre el Saber', '🎒 Aventura Escolar']
      }
    };
  }

  // Halloween (Oct 25 - Nov 2)
  if ((month === 10 && day >= 25) || (month === 11 && day <= 2)) {
    return {
      name: 'halloween',
      emoji: '🎃',
      themes: {
        speed: ['👻 Velocidad Fantasmal', '🎃 Rápido como un Susto', '🦇 Vuelo de Murciélago'],
        accuracy: ['🕷️ Precisión de Telaraña', '🎃 Perfección Calabaza', '👻 Exactitud Escalofriante'],
        consistency: ['🕯️ Constancia Misteriosa', '🎃 Práctica Terrorífica', '👻 Dedicación Espeluznante'],
        improvement: ['🍬 Dulce Mejora', '🎃 Truco o Progreso', '👻 Entrenamiento Fantasmal'],
        exploration: ['🦇 Aventura Nocturna', '🏚️ Casa Embrujada', '🌙 Ruta Misteriosa']
      }
    };
  }

  // Black Friday (Nov 24-30 approx)
  if (month === 11 && day >= 24 && day <= 30) {
    return {
      name: 'blackfriday',
      emoji: '🛍️',
      themes: {
        speed: ['🛍️ Oferta de Velocidad', '🏷️ Descuento en Tiempo', '💳 Rápido al Checkout'],
        accuracy: ['💯 Calidad Garantizada', '🏷️ Precisión en Oferta', '🛍️ Perfección de Compra'],
        consistency: ['💳 Constancia de Ahorro', '🛍️ Práctica de Temporada', '🏷️ Dedicación de Oferta'],
        improvement: ['📈 Sube tu Valor', '🛍️ Gangas de Progreso', '🏷️ Entrenamiento Premium'],
        exploration: ['🔍 Busca las Ofertas', '🛍️ Explora Descuentos', '💳 Ruta de Compras']
      }
    };
  }

  // Christmas Season (Dec 1 - Jan 6) - Placed after others to catch Dec dates
  if ((month === 12) || (month === 1 && day <= 6)) {
    return {
      name: 'christmas',
      emoji: '🎄',
      themes: {
        speed: ['🎅 Rápido como Santa', '⭐ Velocidad de Estrella de Belén', '🎁 Entrega Express de Regalos'],
        accuracy: ['❄️ Precisión de Copo de Nieve', '🔔 Perfección de Campanillas', '✨ Exactitud Navideña'],
        consistency: ['🕯️ Constancia del Adviento', '🎄 Práctica Festiva', '🌟 Dedicación de Reyes'],
        improvement: ['🎁 Regalo de Mejora', '🌟 Brilla como Estrella', '🎅 Entrenamiento de Santa'],
        exploration: ['🦌 Aventura de Rudolph', '⛄ Descubre Nuevos Caminos', '🎿 Expedición Invernal']
      }
    };
  }

  // Spring (Mar 20 - Jun 20)
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return {
      name: 'spring',
      emoji: '🌸',
      themes: {
        speed: ['🌸 Velocidad Floreciente', '🦋 Rápido como Mariposa', '🌷 Velocidad Primaveral'],
        accuracy: ['🌺 Precisión Floral', '🌸 Perfección de Primavera', '🦋 Exactitud Natural'],
        consistency: ['🌱 Constancia que Crece', '🌸 Práctica Floreciente', '🌷 Dedicación Primaveral'],
        improvement: ['🌺 Florecer Mejorando', '🦋 Metamorfosis', '🌸 Entrenamiento Natural'],
        exploration: ['🦋 Aventura Floral', '🌸 Descubre la Naturaleza', '🌷 Ruta de Flores']
      }
    };
  }

  // Autumn (Sep 23 - Dec 20)
  if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
    return {
      name: 'autumn',
      emoji: '🍂',
      themes: {
        speed: ['🍂 Velocidad Otoñal', '🍁 Rápido como Hoja Cayendo', '🌰 Velocidad de Castaña'],
        accuracy: ['🍁 Precisión de Otoño', '🍂 Perfección Dorada', '🌰 Exactitud Natural'],
        consistency: ['🍂 Constancia Otoñal', '🍁 Práctica de Cosecha', '🌰 Dedicación de Otoño'],
        improvement: ['🍂 Cosecha de Mejora', '🍁 Progreso Dorado', '🌰 Entrenamiento Otoñal'],
        exploration: ['🍂 Aventura entre Hojas', '🍁 Descubre el Otoño', '🌰 Ruta del Bosque']
      }
    };
  }

  // Winter (Dec 21 - Mar 19) - Catch-all for non-holiday winter dates
  if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day <= 19)) {
    return {
      name: 'winter',
      emoji: '❄️',
      themes: {
        speed: ['❄️ Velocidad Helada', '⛸️ Deslizamiento Rápido', '🌨️ Ventisca de Teclas'],
        accuracy: ['🧊 Precisión de Hielo', '❄️ Perfección Cristalina', '🌨️ Exactitud Invernal'],
        consistency: ['🔥 Constancia Cálida', '❄️ Práctica Invernal', '🧊 Dedicación Fría'],
        improvement: ['🏔️ Escalada Invernal', '❄️ Rompe el Hielo', '⛸️ Entrenamiento Polar'],
        exploration: ['🏔️ Expedición Ártica', '❄️ Descubre el Frío', '🌨️ Ruta Nevada']
      }
    };
  }

  // Default - No special season
  return {
    name: 'default',
    emoji: '⭐',
    themes: {
      speed: ['Alcanza {target} WPM', 'Velocidad Mejorada', 'Sprint de Teclas'],
      accuracy: ['Precisión del {target}%', 'Perfección al Teclear', 'Exactitud Máxima'],
      consistency: ['Practica {minutes} minutos', 'Constancia Diaria', 'Dedicación al Teclado'],
      improvement: ['Mejora en {mode}', 'Progreso Continuo', 'Entrenamiento Específico'],
      exploration: ['Explora {mode}', 'Descubre Nuevos Modos', 'Aventura de Teclas']
    }
  };
};

/**
 * Generate daily challenges for a user based on their stats and recommendations
 */
const generateDailyChallenges = async (userId) => {
  try {
    // Get user stats
    const statsResult = await sql`
      SELECT 
        AVG(wpm) as avg_wpm,
        AVG(accuracy) as avg_accuracy,
        COUNT(*) as total_sessions,
        SUM(elapsed_time) as total_time
      FROM practice_stats
      WHERE user_id = ${userId}
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const stats = statsResult[0] || { avg_wpm: 0, avg_accuracy: 0, total_sessions: 0, total_time: 0 };
    const challenges = [];
    
    // Get seasonal theme
    const season = getSeasonalTheme();
    const randomIndex = () => Math.floor(Math.random() * 3);

    // 1. Speed Challenge (if WPM < 60)
    if (stats.avg_wpm < 60) {
      const targetWPM = Math.ceil((stats.avg_wpm || 30) + 10);
      const themeTitle = season.themes.speed[randomIndex()];
      challenges.push({
        user_id: userId,
        challenge_type: 'speed',
        title: themeTitle,
        description: `${season.emoji} Completa cualquier práctica alcanzando al menos ${targetWPM} palabras por minuto`,
        target_value: targetWPM,
        difficulty: stats.avg_wpm < 40 ? 'easy' : 'medium',
        date: new Date().toISOString().split('T')[0]
      });
    }

    // 2. Accuracy Challenge (if accuracy < 95%)
    if (stats.avg_accuracy < 95 || !stats.avg_accuracy) {
      const themeTitle = season.themes.accuracy[randomIndex()];
      challenges.push({
        user_id: userId,
        challenge_type: 'accuracy',
        title: themeTitle,
        description: `${season.emoji} Completa un nivel o práctica con al menos 95% de precisión`,
        target_value: 95,
        difficulty: stats.avg_accuracy < 90 ? 'hard' : 'medium',
        date: new Date().toISOString().split('T')[0]
      });
    }

    // 3. Consistency Challenge (always)
    const themeTitle = season.themes.consistency[randomIndex()];
    challenges.push({
      user_id: userId,
      challenge_type: 'consistency',
      title: themeTitle,
      description: `${season.emoji} Dedica al menos 15 minutos a practicar mecanografía hoy`,
      target_value: 15 * 60, // in seconds
      difficulty: 'easy',
      date: new Date().toISOString().split('T')[0]
    });

    // 4. Improvement Challenge (based on weakest mode)
    const modeStats = await sql`
      SELECT 
        source_component as mode,
        AVG(wpm) as avg_wpm,
        COUNT(*) as sessions
      FROM practice_stats
      WHERE user_id = ${userId}
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY source_component
      HAVING COUNT(*) > 2
      ORDER BY AVG(wpm) ASC
      LIMIT 1
    `;

    if (modeStats.length > 0) {
      const weakestMode = modeStats[0];
      const improvementTitle = season.themes.improvement[randomIndex()];
      challenges.push({
        user_id: userId,
        challenge_type: 'improvement',
        title: improvementTitle,
        description: `${season.emoji} Practica ${weakestMode.mode} durante 10 minutos para fortalecer este modo`,
        mode: weakestMode.mode,
        target_value: 10 * 60,
        difficulty: 'medium',
        date: new Date().toISOString().split('T')[0]
      });
    }

    // 5. Exploration Challenge (randomly, 30% chance)
    if (Math.random() > 0.7) {
      const modes = ['CodeMode', 'NumbersMode', 'SymbolsMode', 'DictationMode', 'ZenMode'];
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      const explorationTitle = season.themes.exploration[randomIndex()];
      challenges.push({
        user_id: userId,
        challenge_type: 'exploration',
        title: explorationTitle,
        description: `${season.emoji} Prueba el ${randomMode} y practica durante al menos 5 minutos`,
        mode: randomMode,
        target_value: 5 * 60,
        difficulty: 'easy',
        date: new Date().toISOString().split('T')[0]
      });
    }

    return challenges.slice(0, 5); // Max 5 challenges per day
  } catch (error) {
    console.error('Error generating challenges:', error);
    return [];
  }
};

/**
 * GET /api/challenges/daily
 * Get today's challenges for the authenticated user
 */
router.get('/daily', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Check if challenges already exist for today
    let challenges = await sql`
      SELECT * FROM daily_challenges
      WHERE user_id = ${userId}
      AND date = ${today}
      ORDER BY created_at ASC
    `;

    // If no challenges exist, generate them
    if (challenges.length === 0) {
      const newChallenges = await generateDailyChallenges(userId);
      
      for (const challenge of newChallenges) {
        await sql`
          INSERT INTO daily_challenges ${sql(challenge)}
        `;
      }

      // Fetch the newly created challenges
      challenges = await sql`
        SELECT * FROM daily_challenges
        WHERE user_id = ${userId}
        AND date = ${today}
        ORDER BY created_at ASC
      `;
    }

    res.json({ challenges });
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    res.status(500).json({ error: 'Failed to fetch daily challenges' });
  }
});

/**
 * GET /api/challenges/history
 * Get challenge history for the authenticated user
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, completed } = req.query;

    let query = sql`
      SELECT * FROM daily_challenges
      WHERE user_id = ${userId}
    `;

    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      query = sql`
        SELECT * FROM daily_challenges
        WHERE user_id = ${userId}
        AND completed = ${isCompleted}
      `;
    }

    const challenges = await sql`
      ${query}
      ORDER BY date DESC, created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;

    res.json({ challenges });
  } catch (error) {
    console.error('Error fetching challenge history:', error);
    res.status(500).json({ error: 'Failed to fetch challenge history' });
  }
});

/**
 * PUT /api/challenges/:id/progress
 * Update progress for a specific challenge
 */
router.put('/:id/progress', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    // Verify challenge belongs to user
    const challenge = await sql`
      SELECT * FROM daily_challenges
      WHERE id = ${id}
      AND user_id = ${userId}
    `;

    if (challenge.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Update progress
    const updated = await sql`
      UPDATE daily_challenges
      SET progress = ${progress}
      WHERE id = ${id}
      AND user_id = ${userId}
      RETURNING *
    `;

    res.json({ challenge: updated[0] });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

/**
 * PUT /api/challenges/:id/complete
 * Mark a challenge as completed
 */
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify challenge belongs to user and is not already completed
    const challenge = await sql`
      SELECT * FROM daily_challenges
      WHERE id = ${id}
      AND user_id = ${userId}
    `;

    if (challenge.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge[0].completed) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }

    // Mark as completed
    const updated = await sql`
      UPDATE daily_challenges
      SET 
        completed = true,
        completed_at = CURRENT_TIMESTAMP,
        progress = target_value
      WHERE id = ${id}
      AND user_id = ${userId}
      RETURNING *
    `;

    // Calculate reward points based on difficulty
    const pointsMap = { easy: 10, medium: 25, hard: 50 };
    const points = pointsMap[challenge[0].difficulty] || 10;

    // Award points
    await sql`
      INSERT INTO challenge_rewards (user_id, challenge_id, points)
      VALUES (${userId}, ${id}, ${points})
    `;

    res.json({ 
      challenge: updated[0],
      reward: { points }
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

/**
 * GET /api/challenges/stats
 * Get challenge statistics for the authenticated user
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Total challenges and completed
    const totals = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed
      FROM daily_challenges
      WHERE user_id = ${userId}
    `;

    // Current streak (consecutive days with at least 1 completed challenge)
    const streakResult = await sql`
      WITH daily_completions AS (
        SELECT 
          date,
          COUNT(*) FILTER (WHERE completed = true) as completed_count
        FROM daily_challenges
        WHERE user_id = ${userId}
        GROUP BY date
        ORDER BY date DESC
      ),
      streak_days AS (
        SELECT 
          date,
          ROW_NUMBER() OVER (ORDER BY date DESC) as row_num,
          date - (ROW_NUMBER() OVER (ORDER BY date DESC) * INTERVAL '1 day') as streak_group
        FROM daily_completions
        WHERE completed_count > 0
      )
      SELECT COUNT(*) as streak
      FROM streak_days
      WHERE streak_group = (SELECT streak_group FROM streak_days LIMIT 1)
    `;

    const streak = streakResult[0]?.streak || 0;

    // Total points earned
    const pointsResult = await sql`
      SELECT COALESCE(SUM(points), 0) as total_points
      FROM challenge_rewards
      WHERE user_id = ${userId}
    `;

    res.json({
      total: parseInt(totals[0].total),
      completed: parseInt(totals[0].completed),
      streak: parseInt(streak),
      totalPoints: parseInt(pointsResult[0].total_points)
    });
  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    res.status(500).json({ error: 'Failed to fetch challenge stats' });
  }
});

module.exports = router;
