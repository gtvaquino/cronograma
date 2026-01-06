export const STATES = {
    SUBIDA: 'S',
    INDUCCION: 'I',
    PERFORACION: 'P',
    BAJADA: 'B',
    DESCANSO: 'D',
    NONE: '-'
};

export const generateSchedule = (n, m, inductionDays, totalDays) => {
    // We simulate a bit more to avoid edge effects at the end
    const simulationDays = totalDays + (n + m) * 2;
    const schedule = {
        s1: Array(simulationDays).fill(STATES.NONE),
        s2: Array(simulationDays).fill(STATES.NONE),
        s3: Array(simulationDays).fill(STATES.NONE),
    };

    const cycleLength = n + m;

    // 1. Generate S1 (Strict Anchor)
    for (let d = 0; d < simulationDays; d++) {
        const dayInCycle = d % cycleLength;
        if (dayInCycle === 0) schedule.s1[d] = STATES.SUBIDA;
        else if (dayInCycle <= inductionDays) schedule.s1[d] = STATES.INDUCCION;
        else if (dayInCycle < n) schedule.s1[d] = STATES.PERFORACION;
        else if (dayInCycle === n) schedule.s1[d] = STATES.BAJADA;
        else schedule.s1[d] = STATES.DESCANSO;
    }

    // 2. Resource Pool of Agents
    const agents = [
        { id: 's2', sched: schedule.s2, state: STATES.NONE, daysInState: 0 },
        { id: 's3', sched: schedule.s3, state: STATES.NONE, daysInState: 0 }
    ];

    // Simulation Engine
    for (let d = 0; d < simulationDays; d++) {
        // Step A: Progress States
        agents.forEach(a => {
            a.sched[d] = a.state;
            a.daysInState++;

            // Natural state transitions
            if (a.state === STATES.SUBIDA) {
                a.state = STATES.INDUCCION;
                a.daysInState = 0;
            } else if (a.state === STATES.INDUCCION) {
                if (a.daysInState >= inductionDays) {
                    a.state = STATES.PERFORACION;
                    a.daysInState = 0;
                }
            } else if (a.state === STATES.PERFORACION) {
                // Stay in P as long as needed OR until max N reached
                // Max P days = N - 1 (S) - I
                if (a.daysInState >= (n - 1 - inductionDays)) {
                    a.state = STATES.BAJADA;
                    a.daysInState = 0;
                }
            } else if (a.state === STATES.BAJADA) {
                a.state = STATES.DESCANSO;
                a.daysInState = 0;
            } else if (a.state === STATES.DESCANSO) {
                if (a.daysInState >= (m - 1)) {
                    a.state = STATES.NONE;
                    a.daysInState = 0;
                }
            }
        });

        // Step B: Decision Maker (Rule Enforcer)

        // Count Current Ps
        let currentP = (schedule.s1[d] === STATES.PERFORACION ? 1 : 0);
        agents.forEach(a => { if (a.sched[d] === STATES.PERFORACION) currentP++; });

        // Rule: NEVER 3 Ps
        if (currentP > 2) {
            // Find an agent in P and force them to B
            const pAgents = agents.filter(a => a.sched[d] === STATES.PERFORACION);
            if (pAgents.length > 0) {
                // Priority to the one who has worked longer
                pAgents.sort((a, b) => b.daysInState - a.daysInState);
                const victim = pAgents[0];
                victim.state = STATES.BAJADA;
                victim.daysInState = 0;
                // Note: We already set his sched[d] = P, but he will transition to B tomorrow
            }
        }

        // Rule: ALWAYS 2 Ps (After threshold)
        const targetDay = d + 1 + inductionDays; // When someone starting S today will reach P
        if (targetDay < simulationDays) {
            let predictedP = (schedule.s1[targetDay] === STATES.PERFORACION ? 1 : 0);

            // Check established commitments for targetDay
            agents.forEach(a => {
                // Simplified lookahead: if agent is in S, I, or early P, they will be P at target
                // This is rough but agents react day by day.
                if (a.state === STATES.INDUCCION || a.state === STATES.SUBIDA) predictedP++;
                // If they are in P, check if they will still be in P then
                if (a.state === STATES.PERFORACION) {
                    const remainingP = (n - 1 - inductionDays) - a.daysInState;
                    if (remainingP > (1 + inductionDays)) predictedP++;
                }
            });

            if (predictedP < 2) {
                // We need to launch an agent TODAY if possible
                // High Priority: Agent in NONE
                let candidate = agents.find(a => a.state === STATES.NONE);

                // Medium Priority: Agent in DESCANSO (Interrupting rest is allowed as "se ajustan")
                if (!candidate) {
                    candidate = agents.find(a => a.state === STATES.DESCANSO);
                }

                if (candidate) {
                    candidate.state = STATES.SUBIDA;
                    candidate.daysInState = 0;
                }
            }
        }

        // Initialization Logic
        if (d === 0) agents[0].state = STATES.SUBIDA; // S2 starts with S1
    }

    // Final Trimming and Error Detection
    const result = {
        s1: schedule.s1.slice(0, totalDays),
        s2: schedule.s2.slice(0, totalDays),
        s3: schedule.s3.slice(0, totalDays),
        stats: Array(totalDays).fill(0),
        errors: { p1: [], p3: [], patterns: [] }
    };

    for (let d = 0; d < totalDays; d++) {
        let count = 0;
        if (result.s1[d] === STATES.PERFORACION) count++;
        if (result.s2[d] === STATES.PERFORACION) count++;
        if (result.s3[d] === STATES.PERFORACION) count++;
        result.stats[d] = count;

        if (d > (n + inductionDays + 1) && count < 2) result.errors.p1.push(d);
        if (count > 2) result.errors.p3.push(d);

        ['s1', 's2', 's3'].forEach(key => {
            if (d > 0 && result[key][d] === STATES.SUBIDA && result[key][d - 1] === STATES.SUBIDA) {
                result.errors.patterns.push({ day: d, type: 'S-S', sup: key });
            }
            if (d > 0 && result[key][d] === STATES.BAJADA && result[key][d - 1] === STATES.SUBIDA) {
                result.errors.patterns.push({ day: d, type: 'S-B', sup: key });
            }
        });
    }

    return result;
};
