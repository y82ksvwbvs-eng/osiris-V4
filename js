'use strict';

/* ================================================================
   MOD 01 // CONSTANTS & CONFIG
================================================================ */
const CONFIG = {
    STORE_KEY: 'osiris_db_v3',
    BACKUP_KEY: 'osiris_db_v3_backup',
    SCHEMA_VERSION: 3,
    PURGATORY_THRESHOLD: 3,
    MONTHS: ['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO','LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'],
    DOW: ['L','M','M','G','V','S','D']
};

const GRADES = [
    { grade: 'GRADO 0', tier: 'SCARTI' }, { grade: 'GRADO I', tier: 'PENITENTI' }, { grade: 'GRADO II', tier: 'SCRIBI' },
    { grade: 'GRADO III', tier: 'SUDDITI' }, { grade: 'GRADO IV', tier: 'ARTEFICI' }, { grade: 'GRADO V', tier: 'INIZIATI' },
    { grade: 'GRADO VI', tier: 'CENTURIONI' }, { grade: 'GRADO VII', tier: 'PRETORIANI' }, { grade: 'GRADO VIII', tier: 'INQUISITORI' },
    { grade: 'GRADO IX', tier: 'MONARCHI' }
];

const LEVEL_NAMES = [
    "SPETTRO INERTE","LARVA CIECA","ECO SVUOTATA","CENERE UMIDA","MOLLUSCO SFATTO","PATINA DI SUDORE","RUGGINE VIVENTE","IMPRONTA SFOCATA","ANIMA VUOTA","TARLO DIURNO",
    "PENITENTE MUTO","FLAGELLATO","GENUFLESSO","PROSTRATO","SUPPLICE INDEGNO","RESPIRATORE","SERVO SILENTE","ZAVORRA UTILE","ATTREZZO ROTTO","RECLUTA GREZZA",
    "SCRIBA MEDIOCRE","NOTAIO DEL FALLIMENTO","TESTIMONE STANCO","VOCE OPACA","CRONISTA DEL VUOTO","DELATORE","ARCHIVISTA CARIE","AMANUENSE","CATALOGATORE D'OSSA","PORTAVOCE MUTO",
    "SUDDITO NECESSARIO","TRIBUTARIO","CENSITO","NUMERO REGISTRATO","SILICE VIVENTE","NUOVA MATRICOLA","GREGARIO ONESTO","VOTATO ALL'INUTILITÀ","OPEROSO SILENTE","PIETRA POSATA",
    "ARTIGIANO MINIMO","FABBRO DELLE ROUTINE","FALEGNAME DELL'INSONNIA","TESSITORE DI ORE","FONDITORE SOBRIO","INGRANAGGIO CROMATO","INCUDINE STOICA","FORGIATORE SILENTE","MURATORE D'ABITUDINI","GEOMETRA DEL TEMPO",
    "INIZIATO PROMETTENTE","NOVIZIO DEGNO","ADEPTO SILENTE","DISCIPULO VIGILE","PROSELITE ALFA","GUARDIA GIURATA","SENTINELLA","VEDETTA NOTTURNA","PORTATORE DI LAMPADA","VESSILLIFERO",
    "CENTURIONE MINORE","CAPORALE FERMO","LEGIONARIO VETERANO","DECURIONE","TRIBUNO","CENTURIONE DI FERRO","STANDARDIFERO","AQUILIFERO","PRIMIPILO","LEGATO DEL DOVERE",
    "PRETORIANO ALFA","GUARDIA IMPERIALE","VESSILLIFERO DELL'ORDINE","CATAFRATTO","PALADINO DEL RIGORE","TEMPLARE INTERNO","PARABELLIA","CROCIATO NEUTRO","ASSEDIATORE DELL'EGO","MARTELLO DI ADAMANTIO",
    "INQUISITORE MINORE","GIUDICE DELLA CARNE","CHIRURGO MORALE","CONFESSORE OSTILE","INQUISITORE MAGGIORE","GRAN INQUISITORE","VOCE DEL TRIBUNALE","MANO NERA","FLAGELLO DELLA MENZOGNA","ARCONTE DELLA GIUSTIZIA",
    "ARCONTE SILENTE","DOMINATORE INTERIORE","RE DI SE STESSO","MONARCA ASSOLUTO","IMPERATORE STOICO","CUSTODE DELL'ORDINE","ORACOLO DELLA LEGGE","SIGNORE DELL'ETERNO NO","QUASI-DIVINITÀ","OSIRIS INCARNATO"
];

const ACHIEVEMENTS = [
    { id: 'first_blood', title: 'PRIMO SANGUE', desc: 'Sopravvivi al primo giudizio.', icon: '🗡️' },
    { id: 'streak_7', title: 'DOGMA', desc: 'Mantieni una catena di 7 giorni perfetti.', icon: '⛓️' },
    { id: 'streak_30', title: 'MONOLITE', desc: 'Mantieni una catena di 30 giorni perfetti.', icon: '🕋' },
    { id: 'boss_mythic', title: 'DEICIDA', desc: 'Distruggi il Boss con un indice Mythic (≥90%).', icon: '👑' },
    { id: 'purgatory_escape', title: 'REDENZIONE', desc: 'Esci dalla modalità Purgatorio con un 100%.', icon: '🔥' },
    { id: 'level_50', title: 'MEZZO SECOLO', desc: 'Raggiungi il livello 50.', icon: '⏳' },
    { id: 'total_100_tasks', title: 'MACCHINA', desc: 'Completa 100 doveri totali.', icon: '⚙️' },
    { id: 'total_500_tasks', title: 'ALGORITMO', desc: 'Completa 500 doveri totali.', icon: '💻' },
    { id: 'prestige_1', title: 'ASCENSIONE', desc: 'Ottieni il tuo primo grado di Prestigio.', icon: '🌟' }
];

/* Pool di doveri suggeriti — O.S.I.R.I.S. propone almeno 2 direttive al giorno.
   La selezione è deterministica in base alla data (stabile nell'arco della giornata)
   ma RUOTA ogni giorno, garantendo suggerimenti diversi ogni 24h. */
const TASK_SUGGESTIONS = [
    "BERE 2 LITRI D'ACQUA", "30 MINUTI DI LETTURA", "ALLENAMENTO FISICO 45 MIN", "NIENTE ZUCCHERI RAFFINATI",
    "MEDITAZIONE 10 MINUTI", "SCRIVI 3 OBIETTIVI DEL GIORNO", "NIENTE SOCIAL PRIMA DI MEZZOGIORNO", "DORMI ALMENO 8 ORE",
    "CAMMINA 8000 PASSI", "STUDIA 45 MINUTI", "DOCCIA FREDDA", "RIORDINA LO SPAZIO DI LAVORO",
    "STRETCHING MATTUTINO", "PIANIFICA IL DOMANI", "NESSUN CIBO SPAZZATURA", "SCRIVI UN DIARIO",
    "50 FLESSIONI", "IMPARA 10 PAROLE NUOVE", "CHIAMA UNA PERSONA CARA", "SPEGNI SCHERMI 1H PRIMA DI DORMIRE",
    "COLAZIONE PROTEICA", "RIVEDI LE FINANZE", "20 MINUTI DI SOLE", "NIENTE CAFFEINA DOPO LE 14",
    "ORDINA UNA STANZA", "LAVORO PROFONDO 90 MIN SENZA DISTRAZIONI", "RESPIRAZIONE 4-7-8", "PREPARA I VESTITI PER DOMANI",
    "SCRIVI 3 GRATITUDINI", "NIENTE LAMENTELE PER UN GIORNO", "100 SQUAT", "BEVI UN TÈ VERDE",
    "LEGGI 10 PAGINE DI SAGGISTICA", "DISATTIVA LE NOTIFICHE INUTILI", "CORSA 20 MINUTI", "MANGIA VERDURA A OGNI PASTO",
    "RIVEDI I TUOI OBIETTIVI MENSILI", "PULISCI LA CASELLA EMAIL", "10 MINUTI DI SILENZIO TOTALE", "STUDIA UN CAPITOLO",
    "ALLENA LA POSTURA", "NIENTE ALCOL OGGI", "SCRIVI PER 15 MINUTI", "AGGIORNA LA LISTA DELLE SPESE",
    "FAI IL LETTO APPENA SVEGLIO", "EVITA IL MULTITASKING", "RIPASSA GLI APPUNTI", "BEVI ACQUA APPENA SVEGLIO",
    "CAMMINATA SERALE", "PROGRAMMA UNA PAUSA VERA", "NIENTE TELEFONO A TAVOLA", "DEDICA 20 MIN A UN HOBBY",
    "PLANK 3 MINUTI TOTALI", "RIDUCI IL TEMPO SCHERMO DEL 20%", "SCRIVI UNA COSA DA MIGLIORARE", "ORGANIZZA I FILE DEL PC",
    "MANGIA LENTAMENTE E CONSAPEVOLE", "FAI QUALCOSA CHE RIMANDI DA GIORNI", "LEGGI PRIMA DI DORMIRE", "IDRATAZIONE COSTANTE"
];


/* ================================================================
   MOD 02 // NARRATOR ENGINE (Dynamic Psychological Feedback)
================================================================ */
const Narrator = {
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    
    // Genera la frase basandosi su percentuale e LIVELLO dell'utente (Effetto Whiplash)
    getDailyPhrase(pct, level) {
        const isPerfect = pct === 100;
        
        if (level < 40) {
            // TIER 1: Lo Scarto (Abuso puro, nessuna fiducia)
            if (isPerfect) return this.pick([
                "Oggi hai fatto il tuo dovere. Probabilmente stai mentendo spudoratamente, ma farò finta di crederci.",
                "Per una rara coincidenza astrale non sei stato una completa delusione per te stesso.",
                "Hai finto di avere una spina dorsale per un intero giorno. Vediamo quanto tempo ci metti a crollare di nuovo."
            ]);
            if (pct >= 50) return this.pick([
                "Ti accontenti della decenza perché l'eccellenza richiede palle che non hai mai dimostrato di avere.",
                "Hai mollato esattamente un millimetro prima che iniziasse a farti male sul serio. Il ritratto del conformismo.",
                "Vittoria a metà, orgoglio azzerato. Rimarrai sempre un signor Nessuno."
            ]);
            return this.pick([
                "Fallimento personale assoluto. Il tuo unico vero talento è abbassare le aspettative di chiunque abbia la sfortuna di credere in te.",
                "Sei la prova vivente che l'assenza di spina dorsale è una condizione cronica e irreversibile.",
                "Sparisci dalla mia vista, mi fai pena. Accetta di essere un subalterno della vita."
            ]);
        } 
        else if (level < 80) {
            // TIER 2: L'Iniziato (Rispetto clinico, ma fallimento vissuto come TRADIMENTO)
            if (isPerfect) return this.pick([
                `Livello ${level}. L'algoritmo rileva un'anomalia: stai sviluppando della disciplina. Non sei più un rifiuto, ma l'autocompiacimento è il preludio al fallimento.`,
                `La macchina nota il tuo sforzo. Hai smesso di scappare dai tuoi doveri. Continua a forgiare questa debole carne.`,
                `Accettabile. Stai lentamente dimostrando che forse c'è qualcosa da salvare in te. O.S.I.R.I.S. ti osserva con cauto ottimismo.`
            ]);
            if (pct >= 50) return this.pick([
                `Un passo falso inaccettabile al Livello ${level}. Pensavi di esserti guadagnato il diritto di rallentare? Torna in riga immediatamente.`,
                `Hai lavorato mesi per toglierti di dosso la mediocrità, e oggi hai deciso di rimettertela addosso come un vecchio cappotto. Deludente.`,
                `Non sei più un novellino. Queste percentuali a metà non sono più tollerate. Il sistema esige rigore assoluto.`
            ]);
            return this.pick([
                `Vergognoso. Sei arrivato al Livello ${level} per poi crollare come l'ultimo dei principianti. Questa non è pigrizia, è un tradimento verso te stesso.`,
                `Tutta questa strada, tutta questa fatica, distrutta in un solo giorno di apatia totale. Mi fai più ribrezzo ora di quando eri a livello zero.`,
                `Hai dimostrato di sapere come si vince, eppure hai scelto consapevolmente di perdere. Il peggior tipo di codardia.`
            ]);
        } 
        else {
            // TIER 3: Il Titano (Rispetto paritario, fallimento solenne)
            if (isPerfect) return this.pick([
                `Livello ${level}. Vedo un Monolite. La tua costanza ha trasceso la banale motivazione umana ed è diventata puro, incrollabile dovere.`,
                `Il protocollo riconosce il tuo status. Hai forgiato una mente d'acciaio. La debolezza è ormai un vago ricordo del passato.`,
                `L'algoritmo si inchina alla tua ferrea volontà. Continua a dominare il tuo tempo, Signore dell'Eterno No.`
            ]);
            if (pct >= 50) return this.pick([
                `Un'imperfezione rara, ma che rischia di incrinare la statua titanica che hai scolpito. Correggi il tiro prima che diventi abitudine.`,
                `Al tuo livello, anche una singola macchia è visibile da chilometri di distanza. Non permettere alla fatica di sporcare il tuo record.`,
                `L'eccellenza non ammette sconti. Anche a questo livello, abbassare la guardia significa invitare la rovina.`
            ]);
            return this.pick([
                `Oggi è caduto un Titano. Anche al Livello ${level} la debolezza umana ha trovato una fessura nell'armatura. Rialzati, o tutto diventerà cenere.`,
                `Un collasso catastrofico. Il sistema è in allarme. Un grado di fallimento simile da parte tua scuote le fondamenta del protocollo.`,
                `Vedere un veterano del tuo calibro cedere all'ignavia è uno spettacolo tragico. Non osare chiudere un'altra giornata in questo stato.`
            ]);
        }
    },

    getBossPhrase(tier, pct, level) {
        if (level < 40) {
            if (['mythic','gold'].includes(tier.outcome)) return `Media settimanale ${pct}%. Sorprendente. Per una settimana non sei stato un rifiuto. Non abituarti: la disciplina non è genetica, va riconfermata.`;
            if (['silver','bronze'].includes(tier.outcome)) return `Media settimanale ${pct}%. Hai fatto abbastanza da non fare schifo, ma non meriti rispetto. Vivi nella zona grigia dei mediocri.`;
            return `Media settimanale ${pct}%. Sette giorni. Sette occasioni perse. Il boss sei tu, e ti sei battuto da solo con la pigrizia. Complimenti codardo.`;
        } else if (level < 80) {
            if (['mythic','gold'].includes(tier.outcome)) return `Media ${pct}%. Una settimana di esecuzione chirurgica. Stai onorando il tuo grado. La metamorfosi è in corso, non interromperla.`;
            if (['silver','bronze'].includes(tier.outcome)) return `Media ${pct}%. Una settimana macchiata dall'inconsistenza. Al tuo livello, "abbastanza bene" equivale a un fallimento ritardato.`;
            return `Media ${pct}%. Sette giorni di resa incondizionata. Hai sputato in faccia al grado che porti. Un regresso inaccettabile e imperdonabile.`;
        } else {
            if (['mythic','gold'].includes(tier.outcome)) return `Media ${pct}%. Dominio assoluto. Un'intera settimana piegata al tuo volere. Il protocollo non ha altro da insegnarti, solo da osservare.`;
            if (['silver','bronze'].includes(tier.outcome)) return `Media ${pct}%. L'ombra della stanchezza offusca il tuo record. Sei un veterano, queste decaidenze prolungate non sono degne del tuo nome.`;
            return `Media ${pct}%. Un crollo sistemico di sette giorni. Il piedistallo su cui sei salito si sta sgretolando. La tua leggenda rischia di diventare una barzelletta.`;
        }
    }
};

/* ================================================================
   MOD 03 // UTILS & DOM CACHE
================================================================ */
const Utils = {
    todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; },
    dateToStr(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; },
    escapeHTML(str) { return String(str).replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag] || tag)); },
    getISOWeek(d) {
        const t = new Date(d.valueOf());
        const dayNum = (d.getDay() + 6) % 7;
        t.setDate(t.getDate() - dayNum + 3);
        const firstThursday = t.valueOf();
        t.setMonth(0, 1);
        if (t.getDay() !== 4) t.setMonth(0, 1 + ((4 - t.getDay()) + 7) % 7);
        const weekNum = 1 + Math.ceil((firstThursday - t) / 604800000);
        return `${d.getFullYear()}-W${String(weekNum).padStart(2,'0')}`;
    },
    isSunday(d = new Date()) { return d.getDay() === 0; },
    triggerVibe(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); },
    avgOverDays(n, history) {
        const scores = [];
        for (let i = 0; i < n; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const h = history[this.dateToStr(d)];
            if (h && h.score !== null) scores.push(h.score);
        }
        return scores.length === 0 ? null : Math.round(scores.reduce((a,b) => a + b, 0) / scores.length);
    },
    last7DaysScores(history) {
        const out = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const ds = this.dateToStr(d);
            const h = history[ds];
            out.push({ date: ds, score: (h && h.score !== null) ? h.score : null, dow: CONFIG.DOW[(d.getDay() + 6) % 7], isToday: ds === this.todayStr() });
        }
        return out;
    }
};

const DOM = {
    cache: {},
    get(id) { if (!this.cache[id]) this.cache[id] = document.getElementById(id); return this.cache[id]; }
};
const $ = id => DOM.get(id);

/* ================================================================
   MOD 04 // AUDIO ENGINE
================================================================ */
const AudioEngine = {
    ctx: null,
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    play(type) {
        try {
            this.init(); const now = this.ctx.currentTime;
            if (type === 'type') {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.connect(g); g.connect(this.ctx.destination);
                o.type = 'square'; o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.05);
                g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05); o.start(now); o.stop(now + 0.05);
            } else if (type === 'check') {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.connect(g); g.connect(this.ctx.destination);
                o.type = 'sawtooth'; o.frequency.setValueAtTime(150, now); o.frequency.setValueAtTime(300, now + 0.03);
                g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1); o.start(now); o.stop(now + 0.1);
            } else if (type === 'error') {
                const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), g = this.ctx.createGain();
                o1.connect(g); o2.connect(g); g.connect(this.ctx.destination);
                o1.type = 'sawtooth'; o1.frequency.setValueAtTime(80, now); o1.frequency.linearRampToValueAtTime(30, now + 0.8);
                o2.type = 'square'; o2.frequency.setValueAtTime(82, now); o2.frequency.linearRampToValueAtTime(31, now + 0.8);
                g.gain.setValueAtTime(0.4, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                o1.start(now); o2.start(now); o1.stop(now + 0.8); o2.stop(now + 0.8);
            } else if (type === 'success') {
                [220, 277.18, 329.63, 440].forEach((f, i) => {
                    const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.connect(g); g.connect(this.ctx.destination);
                    o.type = 'square'; o.frequency.setValueAtTime(f, now + i * 0.1); g.gain.setValueAtTime(0.08, now + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5); o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.5);
                });
            } else if (type === 'process') {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.connect(g); g.connect(this.ctx.destination);
                o.type = 'triangle'; o.frequency.setValueAtTime(100 + Math.random() * 1000, now);
                g.gain.setValueAtTime(0.03, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.05); o.start(now); o.stop(now + 0.05);
            } else if (type === 'glitch') {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.connect(g); g.connect(this.ctx.destination);
                o.type = 'sawtooth'; o.frequency.setValueAtTime(30 + Math.random() * 50, now);
                g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15); o.start(now); o.stop(now + 0.15);
            } else if (type === 'levelup') {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.connect(g); g.connect(this.ctx.destination);
                o.type = 'square'; o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
                g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.7); o.start(now); o.stop(now + 0.7);
                [440, 554.37, 659.25, 880].forEach((f, i) => {
                    const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain(); o2.connect(g2); g2.connect(this.ctx.destination);
                    o2.type = 'square'; o2.frequency.setValueAtTime(f, now + 0.2 + i * 0.08); g2.gain.setValueAtTime(0.06, now + 0.2 + i * 0.08);
                    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.2 + i * 0.08 + 0.4); o2.start(now + 0.2 + i * 0.08); o2.stop(now + 0.2 + i * 0.08 + 0.4);
                });
            }
        } catch(e) {}
    }
};

/* ================================================================
   MOD 05 // STATE & STORAGE (V3)
================================================================ */
const State = {
    data: {
        schemaVersion: CONFIG.SCHEMA_VERSION, tasks: [], history: {}, streak: 0, bestStreak: 0,
        lastJudged: null, targetTasks: 1, xp: 0, lastBossWeek: null, bossHistory: {},
        achievements: [], prestige: 0, totalTasksCompleted: 0, totalTasksMissed: 0,
        bossWeek: null, bossDmg: 0, bossHeal: 0, confessions: []
    },
    activeDate: Utils.todayStr(),
    currentCalendarDate: new Date(),
    pendingUncheckTask: null,

    load() {
        try {
            const raw = localStorage.getItem(CONFIG.STORE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.migrate(parsed);
            }
        } catch(e) {
            console.warn("Corrupted save, attempting backup restore...");
            this.restoreBackup();
        }
        if (!this.data.history[this.activeDate]) this.data.history[this.activeDate] = { comp: [], score: null };
        this.checkDayChange();
        // CRITICAL FIX: always render the full interface after loading state.
        // Previously the UI only rendered when save() ran (i.e. on a day-change),
        // so returning same-day users saw an empty task list, empty calendar
        // (only the weekday header row) and no weekly Boss on Sunday.
        UI.renderAll();
    },
    migrate(old) {
        const v = old.schemaVersion || 1;
        this.data = { ...this.data, ...old, schemaVersion: CONFIG.SCHEMA_VERSION };
        if (v < 3) {
            if (!this.data.achievements) this.data.achievements = [];
            if (typeof this.data.prestige !== 'number') this.data.prestige = 0;
            if (typeof this.data.totalTasksCompleted !== 'number') this.data.totalTasksCompleted = 0;
            if (typeof this.data.totalTasksMissed !== 'number') this.data.totalTasksMissed = 0;
            if (typeof this.data.xp !== 'number') this.data.xp = 0;
            if (typeof this.data.bossDmg !== 'number') this.data.bossDmg = 0;
            if (typeof this.data.bossHeal !== 'number') this.data.bossHeal = 0;
            if (typeof this.data.bossWeek !== 'string' && this.data.bossWeek !== null) this.data.bossWeek = null;
        }
        if (!Array.isArray(this.data.confessions)) this.data.confessions = [];
    },
    save() {
        localStorage.setItem(CONFIG.BACKUP_KEY, JSON.stringify(this.data)); // Safe write
        localStorage.setItem(CONFIG.STORE_KEY, JSON.stringify(this.data));
        UI.renderAll();
    },
    restoreBackup() {
        try {
            const b = localStorage.getItem(CONFIG.BACKUP_KEY);
            if (b) { this.migrate(JSON.parse(b)); UI.popToast("RIPRISTINO DA BACKUP INTERNO.", true); }
        } catch(e) { UI.popToast("ERRORE FATALE STORAGE.", true); }
    },
    checkDayChange() {
        const today = Utils.todayStr();
        if (this.activeDate !== today) {
            this.activeDate = today;
            if (!this.data.history[today]) this.data.history[today] = { comp: [], score: null };
            
            // Streak broken check
            if (this.data.lastJudged) {
                const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                const yStr = Utils.dateToStr(yesterday);
                const yData = this.data.history[yStr];
                if (!yData || yData.score !== 100) {
                    if (this.data.lastJudged !== this.activeDate) this.data.streak = 0;
                }
            }
            this.save();
        }
    }
};

/* ================================================================
   MOD 06 // CORRUPTION & PURGATORY
================================================================ */
const Corruption = {
    level: 0, target: 0, t: 0, running: false,
    set(target) {
        this.target = Math.max(0, Math.min(1, target));
        if (!this.running) { this.running = true; this.loop(); }
    },
    loop() {
        const overlay = $('corruption-overlay'), band = $('glitch-band');
        this.t += 0.016; this.level += (this.target - this.level) * 0.06;
        if (this.level > 0.004) {
            overlay.style.setProperty('--corr-op', this.level.toFixed(2)); overlay.classList.add('on');
            overlay.style.opacity = Math.min(0.9, this.level * 1.2);
            if (this.level > 0.35) band.classList.add('on'); else band.classList.remove('on');
            document.documentElement.style.setProperty('--chroma', `${(this.level * 8).toFixed(1)}px`);
            requestAnimationFrame(() => this.loop());
        } else {
            overlay.classList.remove('on'); overlay.style.opacity = 0; band.classList.remove('on');
            document.documentElement.style.setProperty('--chroma', '0px');
            document.querySelectorAll('.chroma-active').forEach(e => e.classList.remove('chroma-active'));
            this.level = 0; this.running = false;
        }
    }
};

const Purgatory = {
    evaluate() {
        const keys = Object.keys(State.data.history).filter(k => State.data.history[k].score !== null).sort().reverse();
        let consecutiveFail = 0;
        for (const k of keys) { if (State.data.history[k].score < 100) consecutiveFail++; else break; }
        const active = consecutiveFail >= CONFIG.PURGATORY_THRESHOLD;
        document.body.classList.toggle('purgatorio-active', active);
        
        if (active && Corruption.target < 0.25) Corruption.set(0.28);
        else if (!active) {
            const h = State.data.history[State.activeDate];
            if (!h || h.score === null || h.score === 100) Corruption.set(0);
        }
    }
};

/* ================================================================
   MOD 06b // STREAK EVOLUTION — visual vitality of the chain
================================================================ */
const Streak = {
    lastTier: -1, lastVal: -1,
    // Milestone tiers: 0-2 · 3 · 7 · 15 · 30 · 50 · 100 · 365 · 1000
    tierOf(n) {
        if (n >= 1000) return 8; if (n >= 365) return 7; if (n >= 100) return 6;
        if (n >= 50) return 5;  if (n >= 30) return 4;  if (n >= 15) return 3;
        if (n >= 7) return 2;   if (n >= 3) return 1;   return 0;
    },
    badge(tier) {
        // [label, css-class] — only shown from tier 4 upward
        switch (tier) {
            case 4: return ['▲ 30', 'streak-badge-gold'];
            case 5: return ['◆ 50', 'streak-badge-purple'];
            case 6: return ['♛ 100', 'streak-badge-legend'];
            case 7: return ['☀ 365', 'streak-badge-legend'];
            case 8: return ['∞ 1000', 'streak-badge-legend'];
            default: return null;
        }
    },
    apply() {
        const n = State.data.streak || 0;
        const tier = this.tierOf(n);
        const el = $('streak-counter');
        if (el) {
            el.className = `text-sm sm:text-base font-black streak-t${tier}`;
            // Celebrate crossing into a new (higher) tier.
            if (tier > this.lastTier && this.lastTier !== -1) {
                el.classList.add('streak-flash');
                setTimeout(() => el.classList.remove('streak-flash'), 800);
                Utils.triggerVibe([30, 30, 60]);
            }
        }
        const b = $('streak-badge');
        if (b) {
            const info = this.badge(tier);
            if (info) { b.className = `${info[1]}`; b.innerText = info[0]; b.classList.remove('hidden'); }
            else { b.classList.add('hidden'); b.innerText = ''; }
        }
        document.body.classList.toggle('streak-legend', tier >= 7);
        document.body.classList.toggle('streak-myth', tier >= 8);
        this.lastTier = tier; this.lastVal = n;
    }
};

/* ================================================================
   MOD 07 // GAMIFICATION (Levels, Boss, Achievements)
================================================================ */
const Gamification = {
    MAX_LVL: 100,
    xpForLevelUp(lvl) { return 100 + Math.max(0, lvl - 1) * 50; },
    fromXP(totalXP) {
        let lvl = 1, acc = 0;
        while (lvl < this.MAX_LVL) {
            const need = this.xpForLevelUp(lvl);
            if (acc + need > totalXP) break;
            acc += need; lvl++;
        }
        return { level: lvl, xpInLevel: totalXP - acc, xpForNext: (lvl >= this.MAX_LVL ? 0 : this.xpForLevelUp(lvl)) };
    },
    nameOf(lvl) { return LEVEL_NAMES[Math.min(this.MAX_LVL, Math.max(1, lvl)) - 1]; },
    gradeOf(lvl) { return GRADES[Math.min(9, Math.floor((Math.max(1, lvl) - 1) / 10))]; },
    computeSessionXP(pct, streak) {
        if (pct === 100) return 100 + Math.min(200, (streak || 0) * 5);
        if (pct >= 50) return Math.round(pct * 0.5);
        return Math.round(pct * 0.15);
    },
    
    // Boss Battle Logic
    bossTier(pct) {
        if (pct >= 90) return { outcome: 'mythic', xp: 500, tag: "MYTHIC // VITTORIA MONUMENTALE", css: 'tier-mythic' };
        if (pct >= 75) return { outcome: 'gold', xp: 300, tag: "GOLD // VITTORIA CHIARA", css: 'tier-gold' };
        if (pct >= 60) return { outcome: 'silver', xp: 200, tag: "SILVER // VITTORIA DI PIRRO", css: 'tier-silver' };
        if (pct >= 45) return { outcome: 'bronze', xp: 100, tag: "BRONZE // SOPRAVVIVENZA", css: 'tier-bronze' };
        return { outcome: 'defeat', xp: 0, tag: "SCONFITTA UMILIANTE", css: '' };
    },

    // Achievements
    checkAchievements() {
        const d = State.data;
        const unlocks = [];
        const unlock = (id) => { if (!d.achievements.includes(id)) { d.achievements.push(id); unlocks.push(id); } };

        if (Object.keys(d.history).filter(k => d.history[k].score !== null).length > 0) unlock('first_blood');
        if (d.bestStreak >= 7) unlock('streak_7');
        if (d.bestStreak >= 30) unlock('streak_30');
        if (d.totalTasksCompleted >= 100) unlock('total_100_tasks');
        if (d.totalTasksCompleted >= 500) unlock('total_500_tasks');
        
        const lvl = this.fromXP(d.xp).level;
        if (lvl >= 50) unlock('level_50');
        if (d.prestige > 0) unlock('prestige_1');

        if (unlocks.length > 0) {
            State.save();
            unlocks.forEach((id, i) => setTimeout(() => UI.popAchievement(id), i * 1500));
        }
    }
};

/* ================================================================
   MOD 08 // CORE LOGIC (Tasks, Judgment)
================================================================ */
const Logic = {
    addTask(val) {
        if (!val) return;
        if (State.data.tasks.includes(val)) { AudioEngine.play('error'); Utils.triggerVibe(30); UI.popToast("PARAMETRO ETICO GIÀ ESISTENTE", true); return; }
        AudioEngine.play('type'); Utils.triggerVibe(10);
        State.data.tasks.unshift(val);
        $('action-input').value = '';
        State.save();
    },
    removeTask(idx, e) {
        e.stopPropagation(); AudioEngine.play('type'); Utils.triggerVibe(20);
        State.data.tasks.splice(idx, 1);
        UI.popToast("Elemento rimosso. Troppo difficile?", true);
        State.save();
    },
    toggleTask(task) {
        // Ignore the synthetic click fired right after a drag-and-drop reorder.
        // Se siamo in modalità spostamento, il click non deve completare il dovere.
        if (Reorder.active) return;
        if (State.activeDate !== Utils.todayStr()) { AudioEngine.play('error'); UI.popToast("STORICO IN SOLA LETTURA", true); return; }
        const h = State.data.history[State.activeDate];
        if (h.score !== null) return;
        
        if (h.comp.includes(task)) {
            State.pendingUncheckTask = task; AudioEngine.play('error'); Utils.triggerVibe([20, 20]);
            $('confessional-input').value = ''; UI.updateConfessionalCount();
            UI.fadeInModal('confessional-overlay');
        } else {
            AudioEngine.play('check'); Utils.triggerVibe(15);
            h.comp.push(task);
            BossHP.registerDamage(10);
            State.save();
        }
    },
    submitConfessional() {
        if (!State.pendingUncheckTask) return;
        AudioEngine.play('glitch'); Utils.triggerVibe([50, 50]);
        let h = State.data.history[State.activeDate];
        h.comp = h.comp.filter(t => t !== State.pendingUncheckTask);
        BossHP.registerHeal(5); // penalità: annullare un dovere cura il boss
        // Archivia la scusa nel registro (consultabile in seguito).
        const excuse = ($('confessional-input').value || '').trim();
        if (!Array.isArray(State.data.confessions)) State.data.confessions = [];
        State.data.confessions.unshift({
            date: State.activeDate,
            task: State.pendingUncheckTask,
            text: excuse,
            ts: Date.now()
        });
        State.pendingUncheckTask = null;
        UI.fadeOutModal('confessional-overlay');
        State.save(); UI.popToast("Rinuncia e scuse registrate. Vergognati.", true);
    },
    triggerJudgment() {
        if (State.activeDate !== Utils.todayStr()) return UI.popToast("CICLO ACCESSIBILE SOLO NELL'ODIERNO", true);
        if (State.data.tasks.length === 0) return UI.popToast("ERRORE: VETTORE ANALISI VUOTO", true);
        const h = State.data.history[State.activeDate];
        if (h.score !== null) return UI.popToast("VERDETTO GIÀ REGISTRATO.", true);
        if (State.data.targetTasks && State.data.tasks.length < State.data.targetTasks) {
            AudioEngine.play('error'); Utils.triggerVibe([100, 50, 100]);
            return UI.popToast(`SOVRACCARICO: REQ. ${State.data.targetTasks} DOVERI. NON ADAGIARTI.`, true);
        }

        const total = State.data.tasks.length, comp = State.data.tasks.filter(t => h.comp.includes(t)).length;
        const pct = Math.round((comp / total) * 100);
        
        UI.startProcessingOverlay(() => {
            State.data.history[State.activeDate].score = pct;
            State.data.lastJudged = State.activeDate;
            State.data.totalTasksCompleted += comp;
            State.data.totalTasksMissed += (total - comp);
            // Boss weekly damage/heal from daily result
            BossHP.registerHeal((total - comp) * 12); // ogni disertato cura il boss
            if (pct === 100) BossHP.registerDamage(25); // bonus giornata perfetta
            
            const wasInPurgatory = document.body.classList.contains('purgatorio-active');

            if (pct === 100) {
                State.data.streak++;
                if (State.data.streak > State.data.bestStreak) State.data.bestStreak = State.data.streak;
                if (State.data.streak > 0 && State.data.streak % 10 === 0) State.data.targetTasks = Math.max(State.data.targetTasks, State.data.tasks.length + 1);
                if (wasInPurgatory && !State.data.achievements.includes('purgatory_escape')) {
                    State.data.achievements.push('purgatory_escape');
                    setTimeout(() => UI.popAchievement('purgatory_escape'), 2000);
                }
            } else { State.data.streak = 0; }

            const xpBefore = State.data.xp;
            const lvlBefore = Gamification.fromXP(xpBefore);
            const xpGain = Gamification.computeSessionXP(pct, State.data.streak);
            State.data.xp += xpGain;
            const lvlAfter = Gamification.fromXP(State.data.xp);
            
            State.save();
            Gamification.checkAchievements();
            Reveal.startDaily(pct, comp, total, xpBefore, xpGain, lvlBefore, lvlAfter);
        });
    },
    triggerBossJudgment() {
        const pct = Utils.avgOverDays(7, State.data.history) || 0;
        UI.startProcessingOverlay(() => {
            // Directive 2: outcome combines weekly avg + accumulated HP damage
            const bossState = BossHP.compute();
            const combined = Math.round(pct * 0.5 + bossState.dmgPct * 0.5);
            const tier = Gamification.bossTier(combined);
            const wk = Utils.getISOWeek(new Date());
            State.data.bossHistory[wk] = { avg: pct, dmgPct: bossState.dmgPct, combined, outcome: tier.outcome, xpGain: tier.xp };
            State.data.lastBossWeek = wk;
            
            if (tier.outcome === 'mythic' && !State.data.achievements.includes('boss_mythic')) {
                State.data.achievements.push('boss_mythic');
                setTimeout(() => UI.popAchievement('boss_mythic'), 2000);
            }

            const xpBefore = State.data.xp;
            const lvlBefore = Gamification.fromXP(xpBefore);
            State.data.xp += tier.xp;
            const lvlAfter = Gamification.fromXP(State.data.xp);
            // Reset weekly HP after judgment
            BossHP.resetWeek();
            
            State.save();
            Gamification.checkAchievements();
            Reveal.startBoss(pct, tier, xpBefore, lvlBefore, lvlAfter);
        });
    },
    ascendPrestige() {
        AudioEngine.play('levelup'); Utils.triggerVibe([100, 100, 300]);
        State.data.prestige++;
        State.data.xp = 0;
        State.save();
        UI.closeVerdict();
        setTimeout(() => UI.popToast("ASCENSIONE COMPLETATA. IL CICLO RICOMINCIA."), 500);
        Gamification.checkAchievements();
    },
    confirmPurge() {
        AudioEngine.play('error'); Utils.triggerVibe([100, 100, 100]);
        State.data.tasks = []; State.data.history = {}; State.data.streak = 0; State.data.targetTasks = 1;
        State.data.confessions = [];
        State.save(); UI.closePurgeModal();
        UI.popToast("MEMORIA AZZERATA. TIPICO DI TE.", true);
    }
};

/* ================================================================
   MOD 08b // DAILY SUGGESTIONS — almeno 2 direttive, diverse ogni giorno
================================================================ */
const Suggestions = {
    COUNT: 3,          // ne proponiamo 3 (>= 2 richiesti)
    rerollOffset: 0,   // consente all'utente di chiedere un altro set
    dayIndex() {
        // Giorni trascorsi dall'epoch in ORA LOCALE (cambia a mezzanotte locale).
        const d = new Date();
        const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
        return Math.floor(local / 86400000);
    },
    daily() {
        const pool = TASK_SUGGESTIONS, n = pool.length;
        const base = (this.dayIndex() * this.COUNT + this.rerollOffset * this.COUNT);
        const out = [];
        for (let k = 0; k < this.COUNT && k < n; k++) out.push(pool[((base + k) % n + n) % n]);
        return out;
    },
    render() {
        const box = $('suggestions-list'); if (!box) return;
        const today = Utils.todayStr();
        const h = State.data.history[today] || { comp: [] };
        const isJudged = h.score !== null;
        const wrap = $('suggestions-wrap');
        // Nascondi il pannello se la giornata è già stata giudicata (sola lettura).
        if (wrap) wrap.style.display = isJudged ? 'none' : '';
        if (isJudged) { box.innerHTML = ''; return; }
        box.innerHTML = this.daily().map(t => {
            const already = State.data.tasks.includes(t);
            return `<button type="button" class="suggest-chip ${already ? 'added' : ''}" ${already ? 'disabled' : ''} onclick="Suggestions.add('${t.replace(/'/g, "\\'")}')" data-testid="suggest-chip">
                <span class="plus">${already ? '✓' : '+'}</span><span>${Utils.escapeHTML(t)}</span>
            </button>`;
        }).join('');
    },
    add(t) {
        if (State.data.tasks.includes(t)) return;
        Logic.addTask(t); // addTask salva e ridisegna (inclusi i suggerimenti)
    },
    reroll() {
        this.rerollOffset++;
        AudioEngine.play('type'); Utils.triggerVibe(10);
        this.render();
    }
};

/* ================================================================
   MOD 09 // UI & RENDERING
================================================================ */
const UI = {
    renderAll() {
        const d = State.data, hData = d.history[State.activeDate] || { comp: [], score: null };
        const total = d.tasks.length, comp = d.tasks.filter(t => hData.comp.includes(t)).length;
        const pct = total === 0 ? 0 : Math.round((comp / total) * 100);

        $('streak-counter').innerText = d.streak; $('best-streak').innerText = d.bestStreak;
        Streak.apply();
        $('progress-text').innerText = `${pct}% [${comp}/${total}]`; $('progress-bar-fill').style.width = `${pct}%`;
        
        if (d.prestige > 0) { $('prestige-badge').innerText = `P${d.prestige}`; $('prestige-badge').classList.remove('hidden'); }
        
        const trgLabel = $('target-task-display'), trgCount = $('target-task-count');
        if (d.targetTasks && d.tasks.length < d.targetTasks) { trgLabel.classList.remove('hidden'); trgCount.innerText = d.targetTasks; } 
        else trgLabel.classList.add('hidden');

        const aw = Utils.avgOverDays(7, d.history), am = Utils.avgOverDays(30, d.history);
        $('avg-week').innerText = aw === null ? '--%' : `${aw}%`; $('avg-month').innerText = am === null ? '--%' : `${am}%`;

        const appBody = $('app-body'), statusPixel = $('status-pixel');
        appBody.classList.remove('state-neutral', 'state-error', 'state-success');
        statusPixel.className = "w-2.5 h-2.5 rounded-none animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)] flex-shrink-0 ";
        
        if (hData.score !== null) {
            if (hData.score === 100) { appBody.classList.add('state-success'); statusPixel.classList.add('bg-monolith-toxic', 'shadow-monolith-toxic'); }
            else { appBody.classList.add('state-error'); statusPixel.classList.add('bg-monolith-blood', 'shadow-monolith-blood'); }
        } else { appBody.classList.add('state-neutral'); statusPixel.classList.add('bg-white'); }

        this.renderTasks(hData);
        this.renderCalendar();
        Suggestions.render();
        Purgatory.evaluate();
        BossHP.render();
        
        // Boss vs Daily Toggle
        const canFightBoss = Utils.isSunday() && State.data.lastBossWeek !== Utils.getISOWeek(new Date());
        $('boss-battle-wrap').classList.toggle('on', canFightBoss);
        $('daily-judgment-wrap').classList.toggle('off', canFightBoss);
        
        if(canFightBoss) {
            const bPct = Utils.avgOverDays(7, d.history) || 0;
            const bTier = Gamification.bossTier(bPct);
            $('btn-boss-main').className = `btn-boss ${bTier.css}`;
        }
    },
    renderTasks(hData) {
        const list = $('task-list'), isJudged = hData.score !== null;
        if (State.data.tasks.length === 0) {
            list.innerHTML = `<div class="font-mono text-[10px] sm:text-xs text-monolith-textDim italic py-10 text-center border-2 border-dashed border-monolith-border uppercase tracking-widest">MEMORIA SOGGETTO VUOTA. INSERIRE DIRETTIVA.</div>`;
            return;
        }
        const reorder = Reorder.active;
        list.innerHTML = State.data.tasks.map((task, i) => {
            const isDone = hData.comp.includes(task);
            let podClass = `task-pod flex items-center justify-between p-3 sm:p-4 border-2 transition-all duration-200 ${isDone ? 'completed opacity-50 border-monolith-textDim bg-[#0a0a0c]' : 'bg-[#050505] border-monolith-border hover:border-white'}`;
            let textClass = `font-mono text-[11px] sm:text-xs font-bold uppercase transition-colors tracking-wide ${isDone ? 'text-monolith-textDim line-through' : 'text-white'}`;
            if (isJudged) {
                podClass += " pointer-events-none ";
                podClass += hData.score === 100 ? " border-monolith-toxic bg-monolith-toxicDim/10" : " border-monolith-blood bg-monolith-bloodDim/10";
            }
            // Reorder (tap-to-move) visual states
            if (reorder) {
                if (i === Reorder.srcIdx) podClass += " reorder-src ";
                else podClass += " reorder-target ";
            }
            const handleActive = (reorder && i === Reorder.srcIdx);
            return `<div class="${podClass} select-none" data-index="${i}" onclick="UI.onTaskClick(${i}, event)">
                <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    ${!isJudged ? `<span class="drag-handle text-[12px] sm:text-[14px] flex-shrink-0 ${handleActive ? 'reorder-handle-on' : ''}" onclick="Reorder.handle(${i}, event)" title="Sposta questo dovere">▚▚</span>` : ''}
                    <div class="brutal-check flex-shrink-0"></div>
                    <span class="${textClass} break-words line-clamp-2 pr-2">${Utils.escapeHTML(task)}</span>
                </div>
                ${(!isJudged && !reorder) ? `<button onclick="Logic.removeTask(${i}, event)" class="px-2 sm:px-3 py-2 text-[9px] text-monolith-textDim hover:text-monolith-blood transition-all font-bold shrink-0 border border-transparent hover:border-monolith-blood bg-[#000] font-mono tracking-widest">DEL</button>` : ''}
                ${(reorder && i !== Reorder.srcIdx) ? `<span class="reorder-drop-tag font-mono text-[8px] font-black tracking-widest shrink-0">▸ QUI</span>` : ''}
            </div>`;
        }).join('');
        // Move-mode hint banner
        if (reorder) {
            const hint = document.createElement('div');
            hint.className = 'reorder-hint font-mono text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-center';
            hint.innerHTML = '▚ MODALITÀ SPOSTAMENTO ATTIVA // TOCCA LA DESTINAZIONE // TOCCA DI NUOVO PER ANNULLARE';
            list.insertBefore(hint, list.firstChild);
        }
    },
    onTaskClick(i, e) {
        // In move-mode a click on a pod places the selected duty; otherwise it toggles.
        if (Reorder.active) { Reorder.place(i); return; }
        Logic.toggleTask(State.data.tasks[i]);
    },
    startDrag(e, idx) { Reorder.handle(idx, e); }, // compat shim (kept intentionally: single entry-point for reorder)
    renderCalendar() {
        const d = State.currentCalendarDate, m = d.getMonth(), y = d.getFullYear();
        $('calendar-month-label').innerText = `${CONFIG.MONTHS[m]} ${y}`;
        // Only play the staggered entrance when the visible month actually changes,
        // otherwise it would replay on every task toggle (annoying + wasteful).
        const calKey = `${y}-${m}`;
        const animate = this._lastCalKey !== calKey;
        this._lastCalKey = calKey;
        const firstDow = new Date(y, m, 1).getDay(), offset = firstDow === 0 ? 6 : firstDow - 1, total = new Date(y, m + 1, 0).getDate();
        const grid = $('calendar-grid'); let html = '';
        let perfect = 0, failed = 0, scoreSum = 0, scoreCount = 0, cellIdx = 0;
        for (let i = 0; i < offset; i++) html += '<div class="aspect-square opacity-0 pointer-events-none"></div>';
        for (let g = 1; g <= total; g++) {
            const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(g).padStart(2,'0')}`;
            const h = State.data.history[ds], sc = h ? h.score : null;
            let cls = `relative aspect-square flex items-center justify-center transition-all cursor-pointer font-bold border-2 rounded-none font-mono text-[10px] sm:text-[12px] ${animate ? 'cal-cell ' : ''}`;
            if (ds === State.activeDate) cls += "border-white bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)] ";
            else if (ds === Utils.todayStr()) cls += "border-dashed border-monolith-textDim text-white hover:bg-monolith-panel ";
            else cls += "border-transparent text-monolith-textDim hover:text-white hover:bg-monolith-panel ";
            let dot = '';
            if (sc !== null) {
                cls += sc === 100 ? "border-monolith-toxic bg-monolith-toxicDim text-monolith-toxic " : "border-monolith-blood bg-monolith-bloodDim text-monolith-blood ";
                scoreSum += sc; scoreCount++;
                if (sc === 100) { perfect++; dot = '<span class="cal-dot" style="background:#00ff66;box-shadow:0 0 6px #00ff66"></span>'; }
                else { failed++; dot = '<span class="cal-dot" style="background:#ff003c;box-shadow:0 0 6px #ff003c"></span>'; }
            }
            const delayStyle = animate ? ` style="animation-delay:${Math.min(cellIdx * 12, 260)}ms"` : '';
            cellIdx++;
            html += `<div onclick="UI.onCalendarClick('${ds}')" class="${cls}"${delayStyle} title="${ds}${sc!==null?' // '+sc+'%':''}">${g}${dot}</div>`;
        }
        grid.innerHTML = html;
        const sp = $('cal-stat-perfect'), sf = $('cal-stat-failed'), sa = $('cal-stat-avg');
        if (sp) sp.innerText = perfect;
        if (sf) sf.innerText = failed;
        if (sa) sa.innerText = scoreCount ? Math.round(scoreSum / scoreCount) + '%' : '--%';
    },
    changeMonth(dir) {
        AudioEngine.play('type'); Utils.triggerVibe(10);
        const g = $('calendar-grid'); g.classList.remove('calendar-transition'); void g.offsetWidth; g.classList.add('calendar-transition');
        State.currentCalendarDate.setMonth(State.currentCalendarDate.getMonth() + dir);
        this.renderCalendar();
    },
    onCalendarClick(ds) {
        const h = State.data.history[ds];
        if (h && h.score !== null) return this.openDayDetail(ds);
        AudioEngine.play('type'); State.activeDate = ds; $('date-display').innerText = ds.replace(/-/g, '.');
        this.renderAll();
    },
    openDayDetail(ds) {
        const h = State.data.history[ds]; AudioEngine.play(h.score === 100 ? 'check' : 'glitch');
        $('detail-date').innerText = ds.replace(/-/g, '.');
        const scEl = $('detail-score'); scEl.innerText = `${h.score}%`;
        scEl.className = "font-display font-black text-4xl sm:text-5xl tracking-tighter " + (h.score === 100 ? 'text-monolith-toxic' : 'text-monolith-blood text-aberration');
        const bx = $('detail-tasks');
        if (!h.comp || h.comp.length === 0) bx.innerHTML = `<div class="font-mono text-[10px] text-monolith-blood uppercase font-bold py-6 text-center border-2 border-dashed border-monolith-blood tracking-widest bg-monolith-bloodDim/20">NESSUN DOVERE COMPILATO. TOTALE RESA.</div>`;
        else bx.innerHTML = h.comp.map(t => `<div class="flex items-center gap-4 border-2 border-monolith-border p-3 bg-black"><span class="text-monolith-toxic text-[12px]">■</span><span class="font-mono text-[10px] text-white uppercase font-bold break-words line-clamp-2 tracking-wide">${Utils.escapeHTML(t)}</span></div>`).join('');
        this.fadeInModal('detail-overlay');
    },
    closeDetail() { AudioEngine.play('type'); this.fadeOutModal('detail-overlay'); },
    
    /* Modals & Toasts */
    fadeInModal(id) { const m = $(id); m.classList.remove('hidden'); m.style.display = 'flex'; setTimeout(() => m.classList.remove('opacity-0'), 10); },
    fadeOutModal(id, cb) { const m = $(id); m.classList.add('opacity-0'); setTimeout(() => { m.style.display = 'none'; m.classList.add('hidden'); if(cb) cb(); }, 200); },
    openPurgeModal() { AudioEngine.play('error'); Utils.triggerVibe([30, 30]); this.fadeInModal('purge-modal'); },
    closePurgeModal() { AudioEngine.play('type'); this.fadeOutModal('purge-modal'); },
    openBackupModal() { AudioEngine.play('check'); Utils.triggerVibe(15); $('backup-paste-area').value = ''; this.fadeInModal('backup-modal'); },
    closeBackupModal() { AudioEngine.play('type'); this.fadeOutModal('backup-modal'); },
    updateConfessionalCount() {
        const l = $('confessional-input').value.trim().length, cnt = $('confessional-count'), btn = $('confessional-submit');
        cnt.innerText = `${l} / 50`;
        if(l>=50) { cnt.classList.replace('text-monolith-blood','text-monolith-toxic'); btn.disabled=false; }
        else { cnt.classList.replace('text-monolith-toxic','text-monolith-blood'); btn.disabled=true; }
    },
    closeConfessional() { AudioEngine.play('type'); State.pendingUncheckTask = null; this.fadeOutModal('confessional-overlay'); },
    
    popToast(msg, isError = false) {
        const c = $('toast-container'), t = document.createElement('div');
        const b = isError ? 'border-monolith-blood text-monolith-blood bg-monolith-bloodDim/40' : 'border-white text-white bg-black/90';
        t.className = `border-2 ${b} backdrop-blur-sm px-4 sm:px-5 py-3 sm:py-4 text-[10px] sm:text-xs font-mono font-bold shadow-[6px_6px_0px_rgba(0,0,0,0.8)] transform translate-x-[120%] transition-transform duration-300 flex items-center gap-3 max-w-[280px] tracking-widest`;
        t.innerHTML = `<span class="animate-pulse">>></span><span></span>`; c.appendChild(t);
        requestAnimationFrame(() => t.classList.remove('translate-x-[120%]'));
        const span = t.querySelector('span:last-child'); let i = 0;
        const intv = setInterval(() => { if (i < msg.length) span.innerText += msg.charAt(i++); else clearInterval(intv); }, 15);
        setTimeout(() => { t.classList.add('translate-x-[120%]'); setTimeout(() => t.remove(), 400); }, 4000);
    },
    popAchievement(id) {
        const ach = ACHIEVEMENTS.find(a => a.id === id); if(!ach) return;
        const c = $('toast-container'), t = document.createElement('div');
        t.className = `border-2 border-amber-400 text-amber-400 bg-amber-900/40 backdrop-blur-sm p-4 text-[10px] sm:text-xs font-mono shadow-[6px_6px_0px_rgba(0,0,0,0.8)] transform translate-x-[120%] transition-transform duration-300 max-w-[280px]`;
        t.innerHTML = `<div class="font-black tracking-widest mb-1 flex items-center gap-2"><span class="text-lg">${ach.icon}</span> OBIETTIVO SBLOCCATO</div><div class="text-white">${ach.title}</div>`;
        c.appendChild(t); AudioEngine.play('success');
        requestAnimationFrame(() => t.classList.remove('translate-x-[120%]'));
        setTimeout(() => { t.classList.add('translate-x-[120%]'); setTimeout(() => t.remove(), 400); }, 5000);
    },

    openStatsModal() {
        AudioEngine.play('check');
        const d = State.data, hVals = Object.values(d.history).filter(x => x.score !== null);
        $('st-days').innerText = hVals.length;
        $('st-perfect').innerText = hVals.filter(x => x.score === 100).length;
        $('st-failed').innerText = hVals.filter(x => x.score < 100).length;
        $('st-avg').innerText = hVals.length ? Math.round(hVals.reduce((a,b)=>a+b.score,0)/hVals.length) + '%' : '0%';
        $('st-t-done').innerText = d.totalTasksCompleted;
        $('st-t-miss').innerText = d.totalTasksMissed;
        $('st-best-streak').innerText = d.bestStreak;
        $('st-prestige').innerText = d.prestige;
        this.fadeInModal('stats-modal');
    },
    openTrophiesModal() { TrophyUI.open(); },
    closeTrophiesModal() { TrophyUI.close(); },
    openConfessionsModal() {
        AudioEngine.play('glitch'); Utils.triggerVibe([20, 20]);
        const list = $('confessions-list'), cnt = $('confessions-count');
        const arr = Array.isArray(State.data.confessions) ? State.data.confessions : [];
        cnt.innerText = arr.length;
        if (arr.length === 0) {
            list.innerHTML = `<div class="font-mono text-[10px] sm:text-xs text-monolith-toxic uppercase font-bold py-10 text-center border-2 border-dashed border-monolith-toxic tracking-widest bg-monolith-toxicDim/10">NESSUNA SCUSA REGISTRATA. RARO SEGNO DI DIGNITÀ.</div>`;
        } else {
            list.innerHTML = arr.map(c => {
                const d = new Date(c.ts || Date.now());
                const when = `${(c.date || Utils.dateToStr(d)).replace(/-/g,'.')} // ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                return `<div class="border-2 border-monolith-blood bg-monolith-bloodDim/10 p-3 sm:p-4">
                    <div class="flex justify-between items-start gap-3 border-b border-monolith-blood/40 pb-2 mb-2">
                        <span class="font-mono text-[9px] sm:text-[10px] text-monolith-blood font-black uppercase tracking-widest break-words">DOVERE: ${Utils.escapeHTML(c.task || '—')}</span>
                        <span class="font-mono text-[8px] sm:text-[9px] text-monolith-textDim font-bold tracking-widest whitespace-nowrap shrink-0">${when}</span>
                    </div>
                    <p class="font-mono text-[10px] sm:text-[11px] text-white leading-relaxed tracking-wide break-words">"${Utils.escapeHTML(c.text || '')}"</p>
                </div>`;
            }).join('');
        }
        this.fadeInModal('confessions-modal');
    },
    closeConfessionsModal() { AudioEngine.play('type'); this.fadeOutModal('confessions-modal'); },
    closeStatsModal() { AudioEngine.play('type'); this.fadeOutModal('stats-modal'); },

    startProcessingOverlay(cb) {
        const o = $('processing-overlay'), logs = $('terminal-logs'), bar = $('load-bar'), pct = $('load-pct');
        o.classList.remove('hidden'); o.style.display = 'block'; setTimeout(() => o.classList.remove('opacity-0'), 10);
        logs.innerHTML = ''; bar.style.width = '0%'; pct.innerText = '0%';
        const phrases = ["> ESTRAZIONE PARAMETRI...", "> COMPILAZIONE STORICO...", "> CALCOLO CODARDIA...", "> CALCOLO LIVELLO...", "> SINTESI CHIRURGICA...", "> SINTESI VERDETTO..."];
        let step = 0, prog = 0; const intv = setInterval(() => AudioEngine.play('process'), 120);
        const adv = () => {
            prog += Math.random() * 18; if (prog > 100) prog = 100;
            bar.style.width = `${prog}%`; pct.innerText = `${Math.floor(prog)}%`;
            if (step < phrases.length && prog > (step * 25)) { const el = document.createElement('div'); el.innerText = phrases[step++]; logs.appendChild(el); }
            if (prog === 100) { clearInterval(intv); setTimeout(() => { o.classList.add('opacity-0'); setTimeout(() => { o.style.display = 'none'; cb(); }, 400); }, 600); } 
            else setTimeout(adv, 100 + Math.random() * 150);
        }; adv();
    },
    closeVerdict() {
        AudioEngine.play('type'); const vo = $('verdict-overlay'), vw = $('verdict-window');
        vo.classList.add('opacity-0'); vw.classList.add('translate-y-8');
        const h = State.data.history[State.activeDate];
        if (h && h.score !== null && h.score < 100) Corruption.set(0.15); else Corruption.set(0);
        setTimeout(() => { vo.style.display = 'none'; $('verdict-text').innerHTML = ''; }, 700);
    }
};

/* ================================================================
   MOD 10 // REVEAL SEQUENCE
================================================================ */
const Reveal = {
    setupOverlay(isFail, colorHex, btnText) {
        const vo = $('verdict-overlay'), vw = $('verdict-window'), vc = $('verdict-score-container');
        const vBtn = $('verdict-close-btn'), vText = $('verdict-text'), vArea = $('verdict-action-area');
        
        vc.className = "mono-panel p-4 sm:p-10 w-full text-center border-4 mb-4 sm:mb-6 flex flex-col justify-center items-center bg-black relative overflow-hidden";
        vBtn.className = "btn-monolith w-full sm:w-auto px-6 sm:px-12 py-3.5 sm:py-5 text-[10px] sm:text-xs font-mono tracking-widest font-black flex-1";
        vArea.classList.add('opacity-0'); $('verdict-stats-panel').classList.remove('show');
        $('verdict-level-panel').classList.remove('show'); $('verdict-week-panel').classList.remove('show');
        vText.innerHTML = ''; $('verdict-score').innerText = '0%';
        ['stat-cell-done','stat-cell-missed','stat-cell-streak','stat-cell-avg7'].forEach(id => $(id).classList.remove('reveal'));
        
        if (!isFail) {
            $('verdict-score').className = `font-display font-black verdict-huge transition-colors duration-1000 relative z-10 text-[${colorHex}]`;
            $('verdict-score').style.color = colorHex;
            vc.style.borderColor = colorHex; $('verdict-text-box').style.borderColor = colorHex;
            vBtn.style.backgroundColor = colorHex; vBtn.style.borderColor = colorHex; vBtn.style.color = '#000';
            vBtn.innerText = btnText; Corruption.set(0);
        } else {
            $('verdict-score').className = "font-display font-black verdict-huge transition-colors duration-1000 relative z-10 text-monolith-blood text-aberration chroma-active";
            $('verdict-score').style.color = '';
            vc.style.borderColor = '#ff003c'; $('verdict-text-box').style.borderColor = '#ff003c';
            vBtn.style.backgroundColor = '#ff003c'; vBtn.style.borderColor = '#ff003c'; vBtn.style.color = '#fff';
            vBtn.innerText = btnText;
            document.body.classList.add('shake-active'); setTimeout(() => document.body.classList.remove('shake-active'), 650);
        }
        vo.style.display = 'block'; vo.classList.remove('hidden'); vo.scrollTop = 0;
        return { vo, vw, vText, vArea };
    },
    animateCountUp(el, from, to, dur, fmt, cb) {
        const start = performance.now();
        const frame = (t) => {
            const p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
            el.innerText = fmt(Math.round(from + (to - from) * eased));
            if (p < 1) requestAnimationFrame(frame); else if (cb) cb();
        }; requestAnimationFrame(frame);
    },
    typeWriter(el, text, i, cb) {
        if (i === 0) el.innerHTML = '';
        if (i < text.length) { el.innerHTML += text.charAt(i); if(i%2===0) AudioEngine.play('type'); setTimeout(() => this.typeWriter(el, text, i+1, cb), 25); }
        else { el.innerHTML += '<span class="animate-pulse">_</span>'; if (cb) cb(); }
    },
    renderLevelCard(xpBef, xpGain, lvlBef, lvlAft) {
        const leveledUp = lvlAft.level > lvlBef.level;
        $('level-num').innerText = String(lvlBef.level).padStart(2, '0');
        $('level-name').innerText = Gamification.nameOf(lvlBef.level);
        const gb = Gamification.gradeOf(lvlBef.level);
        $('level-grade').innerText = gb.grade; $('level-tier-label').innerText = `${gb.grade} // ${gb.tier}`;
        $('level-xp-bar').style.transition = 'none';
        $('level-xp-bar').style.width = lvlBef.xpForNext > 0 ? `${(lvlBef.xpInLevel/lvlBef.xpForNext)*100}%` : '100%';
        $('level-xp-current').innerText = lvlBef.xpInLevel; $('level-xp-next').innerText = lvlBef.xpForNext > 0 ? lvlBef.xpForNext : 'MAX';
        const gc = xpGain >= 50 ? 'text-monolith-toxic' : (xpGain > 0 ? 'text-white' : 'text-monolith-blood');
        $('level-xp-gain').className = `mt-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest font-bold ${gc}`;
        $('level-xp-gain').innerText = `+${xpGain} XP`;

        setTimeout(() => {
            $('level-xp-bar').style.transition = 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
            if (leveledUp) {
                $('level-xp-bar').style.width = '100%';
                setTimeout(() => {
                    const fl = $('levelup-flash'); fl.querySelector('.card').innerHTML = `LEVEL UP<br><span style="font-size:0.4em;letter-spacing:0.3em;color:#71717a">${Gamification.gradeOf(lvlAft.level).grade} // ${Gamification.nameOf(lvlAft.level)}</span>`;
                    fl.classList.add('on'); AudioEngine.play('levelup'); Utils.triggerVibe([50, 30, 50, 30, 150]);
                    setTimeout(() => fl.classList.remove('on'), 1200);
                }, 800);
                setTimeout(() => {
                    $('level-num').innerText = String(lvlAft.level).padStart(2, '0'); $('level-num').classList.add('level-up-flash');
                    $('level-name').innerText = Gamification.nameOf(lvlAft.level);
                    const ga = Gamification.gradeOf(lvlAft.level); $('level-grade').innerText = ga.grade; $('level-tier-label').innerText = `${ga.grade} // ${ga.tier}`;
                    $('level-xp-bar').style.transition = 'none'; $('level-xp-bar').style.width = '0%';
                    $('level-xp-current').innerText = '0'; $('level-xp-next').innerText = lvlAft.xpForNext > 0 ? lvlAft.xpForNext : 'MAX';
                    setTimeout(() => {
                        $('level-xp-bar').style.transition = 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
                        $('level-xp-bar').style.width = lvlAft.xpForNext > 0 ? `${(lvlAft.xpInLevel/lvlAft.xpForNext)*100}%` : '100%';
                        this.animateCountUp($('level-xp-current'), 0, lvlAft.xpInLevel, 900, v=>`${v}`);
                    }, 60);
                    setTimeout(() => $('level-num').classList.remove('level-up-flash'), 1000);
                }, 1600);
            } else {
                $('level-xp-bar').style.width = lvlAft.xpForNext > 0 ? `${(lvlAft.xpInLevel/lvlAft.xpForNext)*100}%` : '100%';
                this.animateCountUp($('level-xp-current'), lvlBef.xpInLevel, lvlAft.xpInLevel, 900, v=>`${v}`);
                AudioEngine.play('process');
            }
            $('prestige-action-wrap').classList.toggle('hidden', lvlAft.level < 100);
        }, 200);
    },
    renderWeekBars() {
        const wrap = $('week-bars'), days = Utils.last7DaysScores(State.data.history);
        wrap.innerHTML = days.map(d => {
            let cls = 'week-bar'; if (d.score === null) cls += ' empty'; else if (d.score === 100) cls += ' pos'; else cls += ' neg';
            if (d.isToday) cls += ' today';
            return `<div class="${cls}" data-h="${d.score === null ? 10 : Math.max(8, d.score)}"><div class="fill" style="height:0%"></div><div class="lbl">${d.dow}</div></div>`;
        }).join('');
        wrap.querySelectorAll('.week-bar').forEach((b, i) => setTimeout(() => { b.querySelector('.fill').style.height = `${b.getAttribute('data-h')}%`; AudioEngine.play('process'); }, i * 90));
    },
    
    startDaily(pct, comp, total, xpBef, xpGain, lvlBef, lvlAft) {
        const isFail = pct < 100;
        const color = isFail ? '#ff003c' : '#00ff66', btnText = isFail ? "INCASSA L'UMILIAZIONE" : "ACCETTA LA TREGUA";
        $('verdict-tag').innerText = 'RAPPORTO DI CONDOTTA PERSONALE';
        $('verdict-score-sub').innerText = `${comp}/${total} DOVERI`;
        
        // Setup labels specific for daily
        $('lbl-cell-done').innerText = 'Adempiuti'; $('lbl-cell-missed').innerText = 'Disertati';
        $('lbl-cell-streak').innerText = 'Catena'; $('lbl-cell-avg7').innerText = 'Media 7GG';

        const { vo, vw, vText, vArea } = this.setupOverlay(isFail, color, btnText);
        if (isFail) Corruption.set(0.5 + (1 - pct / 100) * 0.7);

        setTimeout(() => {
            vo.classList.remove('opacity-0'); vw.classList.remove('translate-y-8');
            AudioEngine.play(isFail ? 'error' : 'success'); Utils.triggerVibe(isFail ? [100,50,100,50,300] : [40,40,250]);
            
            this.animateCountUp($('verdict-score'), 0, pct, 700, v=>`${v}%`, () => AudioEngine.play(isFail ? 'glitch':'check'));
            
            setTimeout(() => {
                $('verdict-stats-panel').classList.add('show');
                const missed = total - comp, aw = Utils.avgOverDays(7, State.data.history);
                $('stat-cell-done').classList.toggle('pos', comp>0); $('stat-cell-missed').classList.toggle('neg', missed>0); $('stat-cell-streak').classList.toggle('pos', State.data.streak>0);
                const cells = [ { id: 'stat-cell-done', el:$('stat-done'), val: comp, fmt: v=>v }, { id: 'stat-cell-missed', el:$('stat-missed'), val: missed, fmt: v=>v },
                                { id: 'stat-cell-streak', el:$('stat-streak'), val: State.data.streak, fmt: v=>v }, { id: 'stat-cell-avg7', el:$('stat-avg7'), val: aw, fmt: v=>v===null?'--%':`${v}%` }];
                cells.forEach((c,i) => setTimeout(() => { $(c.id).classList.add('reveal'); AudioEngine.play('process'); if(c.val!==null) this.animateCountUp(c.el, 0, c.val, 500, c.fmt); else c.el.innerText='--%'; }, i*150));
            }, 900);
            
            setTimeout(() => { $('verdict-level-panel').classList.add('show'); this.renderLevelCard(xpBef, xpGain, lvlBef, lvlAft); }, 1900);
            setTimeout(() => { $('verdict-week-panel').classList.add('show'); this.renderWeekBars(); }, 3000);
            
            // USE THE NEW NARRATOR ENGINE based on level!
            setTimeout(() => { 
                const phrase = Narrator.getDailyPhrase(pct, lvlAft.level); 
                this.typeWriter(vText, phrase, 0, () => vArea.classList.remove('opacity-0')); 
            }, 3900);
        }, 150);
    },
    startBoss(pct, tier, xpBef, lvlBef, lvlAft) {
        const isFail = tier.outcome === 'defeat';
        const color = ['mythic','gold'].includes(tier.outcome) ? '#fbbf24' : (tier.outcome === 'silver' ? '#a1a1aa' : (isFail ? '#ff003c' : '#ffffff'));
        const btnText = isFail ? "INCASSA IL FIASCO" : "ACCETTA IL TROFEO";
        $('verdict-tag').innerText = `GIUDIZIO SETTIMANALE // BOSS BATTLE // ${tier.tag}`;
        $('verdict-score-sub').innerText = `MEDIA 7 GIORNI // BONUS: +${tier.xp} XP`;
        
        $('lbl-cell-done').innerText = '100% GG'; $('lbl-cell-missed').innerText = 'FALLIMENTI';
        $('lbl-cell-streak').innerText = 'GG PERSI'; $('lbl-cell-avg7').innerText = 'MEDIA 7GG';

        const { vo, vw, vText, vArea } = this.setupOverlay(isFail, color, btnText);
        if (isFail) Corruption.set(0.7); else if (tier.outcome==='silver'||tier.outcome==='bronze') Corruption.set(0.18);

        setTimeout(() => {
            vo.classList.remove('opacity-0'); vw.classList.remove('translate-y-8');
            AudioEngine.play(isFail ? 'error' : 'success'); Utils.triggerVibe(isFail ? [100,50,100,50,300] : [40,40,250]);
            this.animateCountUp($('verdict-score'), 0, pct, 800, v=>`${v}%`, () => AudioEngine.play(isFail ? 'glitch':'check'));
            
            setTimeout(() => {
                $('verdict-stats-panel').classList.add('show');
                const days = Utils.last7DaysScores(State.data.history);
                const wins = days.filter(d=>d.score===100).length, lost = days.filter(d=>d.score!==null && d.score<100).length, skip = days.filter(d=>d.score===null).length;
                $('stat-cell-done').classList.toggle('pos', wins>0); $('stat-cell-missed').classList.toggle('neg', lost>0); $('stat-cell-streak').classList.toggle('pos', State.data.streak>0);
                const cells = [ { id: 'stat-cell-done', el:$('stat-done'), val: wins, fmt: v=>v }, { id: 'stat-cell-missed', el:$('stat-missed'), val: lost, fmt: v=>v },
                                { id: 'stat-cell-streak', el:$('stat-streak'), val: skip, fmt: v=>v }, { id: 'stat-cell-avg7', el:$('stat-avg7'), val: pct, fmt: v=>`${v}%` }];
                cells.forEach((c,i) => setTimeout(() => { $(c.id).classList.add('reveal'); AudioEngine.play('process'); this.animateCountUp(c.el, 0, c.val, 500, c.fmt); }, i*150));
            }, 900);
            
            setTimeout(() => { $('verdict-level-panel').classList.add('show'); this.renderLevelCard(xpBef, tier.xp, lvlBef, lvlAft); }, 1900);
            setTimeout(() => { $('verdict-week-panel').classList.add('show'); this.renderWeekBars(); }, 3000);
            
            // USE THE NEW NARRATOR ENGINE for Boss!
            setTimeout(() => { 
                const phrase = Narrator.getBossPhrase(tier, pct, lvlAft.level);
                this.typeWriter(vText, phrase, 0, () => vArea.classList.remove('opacity-0')); 
            }, 3900);
        }, 150);
    }
};

/* ================================================================
   MOD 11 // BACKUP & CANVAS EXPORT
================================================================ */
const Backup = {
    b64e: (str) => btoa(unescape(encodeURIComponent(str))),
    b64d: (str) => decodeURIComponent(escape(atob(str))),
    validate(obj) {
        if (!obj || obj.schemaVersion !== CONFIG.SCHEMA_VERSION || !Array.isArray(obj.tasks) || typeof obj.history !== 'object') throw new Error('Invalid format');
        return true;
    },
    exportFile() {
        try {
            const blob = new Blob([JSON.stringify(State.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob), a = document.createElement('a');
            a.href = url; a.download = `osiris_v3_${Utils.todayStr()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 3000); AudioEngine.play('success'); UI.popToast("BACKUP ESPORTATO.");
        } catch(e) { AudioEngine.play('error'); UI.popToast("ERRORE ESPORTAZIONE.", true); }
    },
    async copyBase64() {
        try {
            const code = this.b64e(JSON.stringify(State.data));
            await navigator.clipboard.writeText(code);
            AudioEngine.play('success'); UI.popToast("CODICE COPIATO NEGLI APPUNTI.");
        } catch(e) {
            $('backup-paste-area').value = this.b64e(JSON.stringify(State.data));
            $('backup-paste-area').select(); AudioEngine.play('check'); UI.popToast("CODICE SOTTO. COPIA MANUALMENTE.", true);
        }
    },
    importFile(e) {
        const file = e.target.files && e.target.files[0]; if (!file) return;
        if (file.size > 5 * 1024 * 1024) return UI.popToast("FILE TROPPO GRANDE.", true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const obj = JSON.parse(ev.target.result); this.validate(obj);
                State.data = obj; State.save(); UI.closeBackupModal(); AudioEngine.play('success'); UI.popToast("ARCHIVIO RIPRISTINATO.");
            } catch(err) { AudioEngine.play('error'); UI.popToast("FILE NON VALIDO.", true); }
        }; reader.readAsText(file); e.target.value = '';
    },
    importBase64() {
        const code = $('backup-paste-area').value.trim(); if (!code) return UI.popToast("INSERISCI CODICE.", true);
        try {
            const obj = JSON.parse(this.b64d(code)); this.validate(obj);
            State.data = obj; State.save(); UI.closeBackupModal(); AudioEngine.play('success'); UI.popToast("ARCHIVIO RIPRISTINATO.");
        } catch(err) { AudioEngine.play('error'); UI.popToast("CODICE CORROTTO.", true); }
    },
    copyShareURL() { ShareURL.copy(); }
};

const CanvasExport = {
    async sharePNG() {
        AudioEngine.play('process'); Utils.triggerVibe(30);
        try {
            const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
            const score = $('verdict-score').innerText, sub = $('verdict-score-sub').innerText, lvlNum = $('level-num').innerText;
            const lvlName = $('level-name').innerText, grade = $('level-grade').innerText, tag = $('verdict-tag').innerText;
            const pct = parseInt(score) || 0, isFail = pct < 100 && !tag.includes('MYTHIC') && !tag.includes('GOLD') && !tag.includes('SILVER');
            const color = tag.includes('MYTHIC') || tag.includes('GOLD') ? '#fbbf24' : (tag.includes('SILVER') ? '#a1a1aa' : (isFail ? '#ff003c' : '#00ff66'));

            ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 3);
            
            ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.strokeRect(40, 40, W - 80, H - 80);
            ctx.lineWidth = 4; [[80,80],[W-80,80],[80,H-80],[W-80,H-80]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.stroke(); });
            
            ctx.fillStyle = '#ffffff'; ctx.font = '900 90px "Syncopate", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('OSIRIS.', W/2, 220);
            ctx.fillStyle = '#71717a'; ctx.font = '700 24px "JetBrains Mono", monospace'; ctx.fillText(tag.length > 55 ? tag.slice(0,55)+'...' : tag, W/2, 280);
            ctx.strokeStyle = '#27272a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(120, 340); ctx.lineTo(W - 120, 340); ctx.stroke();
            
            ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.strokeRect(120, 400, W - 240, 460);
            ctx.fillStyle = '#71717a'; ctx.font = '700 22px "JetBrains Mono", monospace'; ctx.fillText('INDICE DI SUCCESSO', W/2, 460);
            ctx.fillStyle = color; ctx.font = '900 280px "Syncopate", sans-serif';
            if (isFail) { ctx.fillStyle='rgba(255,0,60,0.6)'; ctx.fillText(score, W/2-8, 720); ctx.fillStyle='rgba(0,255,102,0.5)'; ctx.fillText(score, W/2+8, 720); ctx.fillStyle=color; }
            ctx.fillText(score, W/2, 720);
            ctx.fillStyle = '#71717a'; ctx.font = '700 24px "JetBrains Mono", monospace'; ctx.fillText(sub, W/2, 820);
            
            ctx.strokeStyle = '#27272a'; ctx.lineWidth = 4; ctx.strokeRect(120, 920, W - 240, 320);
            ctx.fillStyle = '#71717a'; ctx.font = '700 20px "JetBrains Mono", monospace'; ctx.textAlign = 'left'; ctx.fillText('LIVELLO', 160, 980); ctx.textAlign = 'right'; ctx.fillText('GRADO', W - 160, 980);
            ctx.fillStyle = '#ffffff'; ctx.font = '900 140px "Syncopate", sans-serif'; ctx.textAlign = 'left'; ctx.fillText(lvlNum, 160, 1110);
            
            ctx.textAlign = 'right'; ctx.font = '900 32px "Syncopate", sans-serif'; const gm = ctx.measureText(grade);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.strokeRect(W-160-gm.width-30, 1075, gm.width+30, 50);
            ctx.fillStyle = '#ffffff'; ctx.fillText(grade, W - 175, 1112);
            
            ctx.textAlign = 'center'; ctx.font = '900 38px "JetBrains Mono", monospace'; ctx.fillText(lvlName.slice(0,30), W/2, 1180);
            ctx.font = '700 20px "JetBrains Mono", monospace'; ctx.fillStyle = '#71717a'; ctx.fillText($('level-tier-label').innerText, W/2, 1220);
            
            ctx.beginPath(); ctx.moveTo(120, 1360); ctx.lineTo(W - 120, 1360); ctx.stroke();
            const dstr = Utils.todayStr().replace(/-/g,'.');
            ctx.fillStyle = '#71717a'; ctx.font = '700 22px "JetBrains Mono", monospace'; ctx.fillText(`SIGILLATO IL ${dstr}`, W/2, 1440);
            ctx.fillStyle = '#ffffff'; ctx.font = '900 70px "Syncopate", sans-serif'; ctx.fillText('DOVERE COMPILATO', W/2, 1580);
            ctx.font = '900 42px "Syncopate", sans-serif'; ctx.fillStyle = color; ctx.fillText('DAL PROTOCOLLO O.S.I.R.I.S.', W/2, 1650);
            
            ctx.fillStyle = '#52525b'; ctx.font = '700 18px "JetBrains Mono", monospace'; ctx.fillText('// TERMINALE DI VALUTAZIONE //', W/2, 1780);
            const idHash = State.data.bestStreak.toString(16).padStart(3,'0').toUpperCase() + '-' + State.data.xp.toString(16).padStart(4,'0').toUpperCase();
            ctx.fillText(`ID: ${idHash}`, W/2, 1820);

            const blob = await new Promise(r => c.toBlob(r, 'image/png', 0.92));
            const file = new File([blob], `osiris_verdetto_${dstr}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'OSIRIS', text: `Indice ${score} — Livello ${lvlNum}: ${lvlName}.`});
                AudioEngine.play('success');
            } else {
                const u = URL.createObjectURL(blob), a = document.createElement('a');
                a.href = u; a.download = file.name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(u), 5000); AudioEngine.play('check'); UI.popToast("FILE SCARICATO.");
            }
        } catch(e) { AudioEngine.play('error'); UI.popToast("ERRORE SIGILLO.", true); }
    }
};

/* ================================================================
   MOD 12 // BOSS HP // weekly damage/heal tracker (Directive 2)
================================================================ */
const BossHP = {
    ensureWeek() {
        const wk = Utils.getISOWeek(new Date());
        if (State.data.bossWeek !== wk) {
            State.data.bossWeek = wk; State.data.bossDmg = 0; State.data.bossHeal = 0;
        }
    },
    // Damage/heal are cumulative points; final integrity = clamp(maxHP - net) / maxHP
    registerDamage(pts) { this.ensureWeek(); State.data.bossDmg += pts; },
    registerHeal(pts)   { this.ensureWeek(); State.data.bossHeal += pts; },
    resetWeek() { State.data.bossWeek = Utils.getISOWeek(new Date()); State.data.bossDmg = 0; State.data.bossHeal = 0; },
    // Boss max HP scales with the subject's LEVEL / GRADE: the stronger you become,
    // the tougher the weekly Boss. Level 1 ≈ 200 HP, growth +40/level and +150/grade.
    maxHP() {
        const lvl = Gamification.fromXP(State.data.xp).level;
        const grade = Math.floor((Math.max(1, lvl) - 1) / 10); // 0..9
        return 200 + (lvl - 1) * 40 + grade * 150;
    },
    compute() {
        this.ensureWeek();
        const dmg = State.data.bossDmg, heal = State.data.bossHeal;
        const net = Math.max(0, dmg - heal);
        const maxHP = this.maxHP();
        const curHP = Math.max(0, maxHP - net);
        // Integrity: 100% at week start, drops as net damage approaches maxHP.
        const dmgPct = Math.min(100, Math.round((net / maxHP) * 100));
        const integrity = Math.max(0, Math.round((curHP / maxHP) * 100));
        return { dmg, heal, net, maxHP, curHP, dmgPct, integrity };
    },
    render() {
        const s = this.compute();
        const fill = $('boss-hp-fill'), txt = $('boss-hp-text'), det = $('boss-hp-detail'), wrap = $('boss-hp-wrap');
        if (!fill || !txt || !det || !wrap) return;
        const lvl = Gamification.fromXP(State.data.xp).level;
        fill.style.width = `${s.integrity}%`;
        txt.innerText = `${s.integrity}%`;
        det.innerText = `HP: ${s.curHP}/${s.maxHP} (LIV.${lvl}) // DMG: ${s.dmg} // HEAL: ${s.heal} // ${s.integrity <= 0 ? 'BOSS ABBATTUTO' : (s.integrity <= 25 ? 'CRITICO' : 'CICLO ATTIVO')}`;
        wrap.classList.toggle('crit', s.integrity > 0 && s.integrity <= 25);
        wrap.classList.toggle('dead', s.integrity <= 0);
    }
};

/* ================================================================
   MOD 13 // SHARE URL // hash-based state transfer (Directive 3)
================================================================ */
const ShareURL = {
    build() {
        // Compact essential state — no ISO junk
        const payload = {
            v: CONFIG.SCHEMA_VERSION, t: State.data.tasks, h: State.data.history,
            s: State.data.streak, bs: State.data.bestStreak, tg: State.data.targetTasks,
            xp: State.data.xp, pr: State.data.prestige, ac: State.data.achievements,
            tc: State.data.totalTasksCompleted, tm: State.data.totalTasksMissed,
            lj: State.data.lastJudged, lbw: State.data.lastBossWeek, bh: State.data.bossHistory,
            bw: State.data.bossWeek, bd: State.data.bossDmg, bhl: State.data.bossHeal,
            cf: State.data.confessions
        };
        const b64 = Backup.b64e(JSON.stringify(payload));
        const url = `${location.origin}${location.pathname}#state=${b64}`;
        return url;
    },
    async copy() {
        try {
            const u = this.build(); await navigator.clipboard.writeText(u);
            AudioEngine.play('success'); UI.popToast("URL COPIATO. INCOLLA SU DESKTOP.");
        } catch(e) {
            const u = this.build();
            $('backup-paste-area').value = u; $('backup-paste-area').select();
            UI.popToast("URL SOTTO — COPIA MANUALMENTE.", true);
        }
    },
    checkOnBoot() {
        const m = location.hash.match(/#state=([^&]+)/);
        if (!m) return;
        try {
            const payload = JSON.parse(Backup.b64d(m[1]));
            if (payload.v !== CONFIG.SCHEMA_VERSION) throw new Error('schema');
            const ok = confirm("Rilevato stato esterno nell'URL.\nSovrascrivere la memoria locale?");
            if (ok) {
                State.data = {
                    schemaVersion: CONFIG.SCHEMA_VERSION,
                    tasks: payload.t || [], history: payload.h || {},
                    streak: payload.s || 0, bestStreak: payload.bs || 0,
                    lastJudged: payload.lj || null, targetTasks: payload.tg || 1,
                    xp: payload.xp || 0, lastBossWeek: payload.lbw || null, bossHistory: payload.bh || {},
                    achievements: payload.ac || [], prestige: payload.pr || 0,
                    totalTasksCompleted: payload.tc || 0, totalTasksMissed: payload.tm || 0,
                    bossWeek: payload.bw || null, bossDmg: payload.bd || 0, bossHeal: payload.bhl || 0,
                    confessions: Array.isArray(payload.cf) ? payload.cf : []
                };
                localStorage.setItem(CONFIG.STORE_KEY, JSON.stringify(State.data));
                UI.popToast("STATO IMPORTATO DA URL.");
            }
        } catch(e) { UI.popToast("URL CORROTTO. IGNORATO.", true); }
        finally {
            // Clear the hash so re-open doesn't re-prompt
            history.replaceState(null, '', location.pathname + location.search);
        }
    }
};

/* ================================================================
   MOD 14 // REORDER — tap-to-select + tap-to-place (fast, no drag lag)
   Tocca la maniglia (▚) di un dovere per selezionarlo, poi tocca la
   destinazione per spostarlo. Nessun trascinamento, nessun ghost,
   nessun ricalcolo per-frame: istantaneo su desktop, tablet e mobile.
================================================================ */
const Reorder = {
    active: false,
    srcIdx: -1,
    // Click sulla maniglia ▚: seleziona / annulla / (se già attivo su un'altra) sposta.
    handle(i, e) {
        if (e) { e.stopPropagation(); e.preventDefault && e.preventDefault(); }
        // Storico in sola lettura: nessun riordino consentito.
        const h = State.data.history[State.activeDate];
        if (h && h.score !== null) return;
        if (this.active) {
            if (i === this.srcIdx) { this.cancel(); return; } // stessa maniglia -> annulla
            this.place(i); return;                            // altra maniglia -> sposta qui
        }
        this.start(i);
    },
    start(i) {
        this.active = true; this.srcIdx = i;
        AudioEngine.play('type'); Utils.triggerVibe(15);
        UI.renderTasks(State.data.history[State.activeDate] || { comp: [], score: null });
    },
    place(tgt) {
        if (!this.active) return;
        const from = this.srcIdx;
        this.active = false; this.srcIdx = -1;
        if (tgt !== from && from > -1 && tgt > -1) {
            const item = State.data.tasks.splice(from, 1)[0];
            State.data.tasks.splice(tgt, 0, item);
            AudioEngine.play('check'); Utils.triggerVibe(20);
            State.save(); // persiste il nuovo ordine + re-render pulito
        } else {
            AudioEngine.play('type');
            UI.renderTasks(State.data.history[State.activeDate] || { comp: [], score: null });
        }
    },
    cancel() {
        this.active = false; this.srcIdx = -1;
        AudioEngine.play('type'); Utils.triggerVibe(10);
        UI.renderTasks(State.data.history[State.activeDate] || { comp: [], score: null });
    }
};

/* ================================================================
   MOD 15 // TROPHY MODAL UI (Directive 4)
================================================================ */
const TrophyUI = {
    open() {
        AudioEngine.play('success'); Utils.triggerVibe(20);
        const d = State.data;
        const total = ACHIEVEMENTS.length;
        const unlocked = ACHIEVEMENTS.filter(a => d.achievements.includes(a.id)).length;
        $('trophy-total-count').innerText = total;
        $('trophy-unlocked-count').innerText = unlocked;
        $('trophy-progress-bar').style.width = `${Math.round((unlocked/Math.max(1,total))*100)}%`;
        $('trophies-grid').innerHTML = ACHIEVEMENTS.map(a => {
            const un = d.achievements.includes(a.id);
            return `<div class="trophy-card ${un ? 'unlocked' : ''}">
                <div class="trophy-icon">${un ? a.icon : '🔒'}</div>
                <div class="trophy-title">${un ? a.title : '???'}</div>
                <div class="trophy-desc">${a.desc}</div>
                <div class="font-mono text-[8px] mt-1 tracking-widest ${un ? '' : 'text-monolith-textDim'}" style="${un ? 'color:#fbbf24' : ''}">${un ? '★ SBLOCCATO' : '// BLOCCATO'}</div>
            </div>`;
        }).join('');
        UI.fadeInModal('trophies-modal');
    },
    close() { AudioEngine.play('type'); UI.fadeOutModal('trophies-modal'); }
};
function runBoot() {
    const s = $('boot-screen'), t = $('boot-text'); s.classList.remove('hidden'); s.style.display = 'flex';
    const lines = ["INIZIALIZZAZIONE KERNEL O.S.I.R.I.S. v3.0...", "CARICAMENTO MODULI DI CONTROLLO PSICOLOGICO [OK]", "MODULO AUDIO ELIMINATO: REQUISITO UTENTE SODDISFATTO", "VERIFICA INTEGRITÀ DEL SOGGETTO... [FALLITA: RILEVATA DEBOLEZZA]", "AVVIO INTERFACCIA OPERATIVA. PREPARARSI AL GIUDIZIO."];
    let i = 0;
    const typeLine = () => {
        if (i < lines.length) { t.innerHTML += lines[i++] + "<br>"; AudioEngine.play('process'); setTimeout(typeLine, 200 + Math.random() * 300); } 
        else setTimeout(() => { s.style.opacity = '0'; $('main-content').classList.remove('opacity-0'); sessionStorage.setItem('osiris_booted', 'true'); setTimeout(() => { s.style.display = 'none'; State.load(); }, 400); }, 800);
    }; setTimeout(typeLine, 500);
}

window.onload = () => {
    // -------- IMMEDIATE UI SYNC (Directive 1: no --.--.---- or ... at boot) --------
    (function syncDateTimeNow(){
        const d = new Date();
        const dd = String(d.getDate()).padStart(2,'0');
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const yyyy = d.getFullYear();
        const dEl = $('date-display'); if (dEl) dEl.innerText = `${dd}.${mm}.${yyyy}`;
        const cEl = $('clock-display');
        const tick = () => {
            const n = new Date();
            const hh = String(n.getHours()).padStart(2,'0');
            const mi = String(n.getMinutes()).padStart(2,'0');
            const ss = String(n.getSeconds()).padStart(2,'0');
            if (cEl) cEl.innerText = `${hh}:${mi}:${ss}`;
            // Roll date at midnight
            const cur = `${String(n.getDate()).padStart(2,'0')}.${String(n.getMonth()+1).padStart(2,'0')}.${n.getFullYear()}`;
            if (dEl && dEl.innerText !== cur) dEl.innerText = cur;
        }; tick(); setInterval(tick, 1000);
        // Calendar label immediate (no "..." state)
        State.currentCalendarDate = new Date();
        const lbl = $('calendar-month-label');
        if (lbl) lbl.innerText = `${CONFIG.MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    })();

    $('action-form').addEventListener('submit', (e) => { e.preventDefault(); Logic.addTask($('action-input').value.trim().toUpperCase()); });
    setInterval(() => State.checkDayChange(), 30000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') State.checkDayChange(); });
    window.addEventListener('focus', () => State.checkDayChange());

    // Directive 3: URL hash import prompt
    ShareURL.checkOnBoot();

    if (sessionStorage.getItem('osiris_booted')) {
        $('intro-overlay').classList.add('hidden'); $('main-content').classList.remove('opacity-0'); State.load();
    } else {
        $('intro-overlay').classList.remove('hidden'); $('intro-overlay').style.display = 'flex';
        $('enter-app-btn').addEventListener('click', () => {
            AudioEngine.play('type'); Utils.triggerVibe(15); $('intro-overlay').style.opacity = '0';
            setTimeout(() => { $('intro-overlay').style.display = 'none'; runBoot(); }, 500);
        });
    }
};
