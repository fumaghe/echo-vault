const IMG = `${import.meta.env.BASE_URL}assets/echo-workshop/`;

export type SplunkQuery = { title: string; query: string };

export type Challenge = {
  id: string;
  order: number;
  code: string; // A..F
  title: string;
  subtitle: string;
  artifactImage: string;
  briefing: string[];
  objective: string;
  dataset: string[];
  aiPrompt: string;
  splunkQueries: SplunkQuery[];
  expectedAnswers: string[];
  expectedFragment: string;
  hints: string[];
  successMessage: string;
  extra?: string;
  links?: Array<{ label: string; url: string }>;
};

export const FINAL_CODE = "MR-E3-42-V27-HY-AP";
export const VAULT_KEY = "MILO-042";
export const FACILITATOR_CODE = "ECHO-ADMIN";

export const challenges: Challenge[] = [
  {
    id: "A",
    code: "A",
    order: 1,
    title: "Il servizio che urla",
    subtitle: "Volume non è gravità",
    artifactImage: `${IMG}step1.png`,
    briefing: [
      "Durante la finestra 06:30 - 09:30 sono stati osservati diversi segnali anomali sui servizi Echo.",
      "Il volume totale degli eventi non è sufficiente per identificare il servizio impattato: alcuni servizi parlano molto, ma non sbagliano davvero.",
      "Nota operativa: non fidatevi del servizio più rumoroso. Cercate quello con il peggior error rate.",
    ],
    objective:
      "Identificare il servizio che presenta il peggior rapporto tra errori e volume totale.",
    dataset: ["tmp_echo_diag.csv"],
    aiPrompt: `Sono composto da due parole.
La prima sembra un acronimo.
La seconda decide dove mandare il traffico.
Se prendi le iniziali della mia identità,
ottieni il primo frammento.

Chi sono?`,
    splunkQueries: [
      {
        title: "Error rate per servizio",
        query: `| inputlookup tmp_echo_diag.csv
| eval clean_status=upper(trim(status))
| eval is_error=if(clean_status="KO" OR clean_status="ERROR" OR clean_status="FAIL" OR clean_status="FAILED" OR error_code!="200",1,0)
| stats count as total_events sum(is_error) as error_events avg(latency_ms) as avg_latency by service
| eval error_rate=round((error_events/total_events)*100,2)
| sort -error_rate`,
      },
    ],
    expectedAnswers: ["mso-router", "mso_router", "msorouter"],
    expectedFragment: "MR",
    hints: ["Il servizio più rumoroso non è sempre quello più fragile."],
    successMessage: "Servizio identificato: mso-router.",
  },
  {
    id: "B",
    code: "B",
    order: 2,
    title: "Il log indecifrabile",
    subtitle: "Tre maschere, un solo nodo",
    artifactImage: `${IMG}step2.png`,
    briefing: [
      "I log grezzi sono stati esportati in emergenza. Il parser ufficiale non funziona.",
      "Tutti gli eventi sono finiti dentro una singola colonna. Prima di capire cosa è successo, bisogna ricostruire il linguaggio dei log.",
      "Problemi noti: separatori incoerenti, timestamp in formati diversi, host scritti in modi diversi, ticket scritti in modi diversi, BB_ID scritti in modi diversi, latency a volte non numerica.",
      "Consiglio: Usate l'AI ;)",
    ],
    objective:
      "Normalizzare i log e identificare l'host più coinvolto negli errori del servizio sospetto.",
    dataset: ["tmp_echo_logs.csv"],
    aiPrompt: `Ho un nome con un trattino.
Ma nei log perdo spesso il trattino.
A volte urlo in maiuscolo.
A volte mi scrivono tutto attaccato.
Sono il bordo dove Echo inciampa.

Prendi la mia iniziale e il mio numero.`,
    splunkQueries: [
      {
        title: "Normalizzazione log e top host",
        query: `| inputlookup tmp_echo_logs.csv
| eval raw=raw_event
| eval service=case(match(raw,"(?i)mso[\\s_-]?router"),"mso-router",match(raw,"(?i)billing[\\s_-]?gateway"),"billing-gateway",match(raw,"(?i)auth-api"),"auth-api",match(raw,"(?i)telemetry-ingestor"),"telemetry-ingestor",match(raw,"(?i)customer-portal"),"customer-portal",match(raw,"(?i)notification-service"),"notification-service",1=1,"unknown")
| eval host=case(match(raw,"(?i)edge[-_ ]?03"),"edge-03",match(raw,"(?i)edge[-_ ]?02"),"edge-02",match(raw,"(?i)edge[-_ ]?01"),"edge-01",match(raw,"(?i)app-07"),"app-07",match(raw,"(?i)app-11"),"app-11",match(raw,"(?i)ingest-02"),"ingest-02",1=1,"unknown")
| eval severity=case(match(raw,"(?i)(sev|severity|level)[=:\\s\\"']*(error|err)"),"ERROR",match(raw,"(?i)\\sERROR\\s|\\serr\\s"),"ERROR",1=1,"INFO")
| rex field=raw "(?i)(?:code|http|http_code|status_code|response|HTTP)[=:\\s\\"']*(?<http_code>\\d{3})"
| rex field=raw "(?i)(?:lat|latency|latency_ms|duration)[=:\\s\\"']*(?<latency_raw>N/A|\\d+)"
| eval latency_ms=tonumber(replace(latency_raw,"[^0-9]",""))
| search service="mso-router" severity="ERROR"
| stats count as error_events avg(latency_ms) as avg_latency values(http_code) as http_codes by host
| sort -error_events`,
      },
    ],
    expectedAnswers: ["edge-03", "edge03", "edge_03"],
    expectedFragment: "E3",
    hints: ["Lo stesso nodo indossa più maschere."],
    successMessage: "Host identificato: edge-03.",
  },
  {
    id: "C",
    code: "C",
    order: 3,
    title: "Il ticket fantasma",
    subtitle: "Duplicato perché mai normalizzato",
    artifactImage: `${IMG}step3.png`,
    briefing: [
      "L'ITSM ha esportato alcuni ticket aperti nella finestra dell'incidente. Uno dei ticket compare più volte, ma non sempre nello stesso formato.",
      "Possibili anomalie: maiuscole/minuscole incoerenti, trattino mancante, spazi finali, owner mancante, descrizioni simili ma non identiche.",
      "Il ticket fantasma non è duplicato per errore. È duplicato perché nessuno lo ha normalizzato.",
    ],
    objective: "Identificare il ticket principale e il BB_ID collegato.",
    dataset: ["tmp_echo_tickets.csv", "tmp_echo_logs.csv"],
    aiPrompt: `Sono dentro un ticket.
Sono dentro un BB_ID.
Sono anche il numero che torna quando il formato cambia.

Se trovi l’incidente giusto e il broadband giusto,
prendi solo le ultime due cifre più importanti.`,
    splunkQueries: [
      {
        title: "Correlazione ticket / BB_ID",
        query: `| inputlookup tmp_echo_logs.csv
| eval raw=raw_event
| eval service=case(match(raw,"(?i)mso[\\s_-]?router"),"mso-router",1=1,"unknown")
| eval host=case(match(raw,"(?i)edge[-_ ]?03"),"edge-03",1=1,"unknown")
| eval severity=case(match(raw,"(?i)(sev|severity|level)[=:\\s\\"']*(error|err)"),"ERROR",1=1,"INFO")
| rex field=raw "(?i)(?:bb|BB_ID|broadband)[=:\\s\\"']*(?<bb_raw>bb-?\\d{3}|BB-?\\d{3})"
| rex field=raw "(?i)(?:ticket|case|incident)[=:\\s\\"']*(?<ticket_raw>inc-?\\d{4}|INC-?\\d{4})"
| rex field=raw "(?i)(?:code|http|http_code|status_code|response|HTTP)[=:\\s\\"']*(?<http_code>\\d{3})"
| eval bb_digits=replace(upper(bb_raw),"[^0-9]","")
| eval BB_ID=if(len(bb_digits)=3,"BB-".bb_digits,bb_raw)
| eval ticket_digits=replace(upper(ticket_raw),"[^0-9]","")
| eval ticket_id=if(len(ticket_digits)=4,"INC-".ticket_digits,ticket_raw)
| search service="mso-router" host="edge-03" severity="ERROR"
| stats count as hits values(BB_ID) as bb_ids values(http_code) as http_codes by ticket_id
| sort -hits`,
      },
    ],
    expectedAnswers: [
      "inc-4721",
      "inc4721",
      "bb-042",
      "bb042",
      "inc-4721 bb-042",
      "inc-4721 e bb-042",
      "inc-4721, bb-042",
    ],
    expectedFragment: "42",
    hints: ["Il numero resta lo stesso anche quando il formato cambia."],
    successMessage: "Ticket: INC-4721 — BB-042.",
  },
  {
    id: "D",
    code: "D",
    order: 4,
    title: "La release maledetta",
    subtitle: "Ogni cambiamento lascia un'ombra",
    artifactImage: `${IMG}step4.png`,
    briefing: [
      "Un deploy non è una colpa. Ma ogni cambiamento lascia un'ombra.",
      "Mail release-bot — Ciao team, il deploy della versione v27 è stato completato sui nodi previsti.",
      "Dettagli: servizio mso-router, host edge-03, orario 2026-05-22 07:42:00, owner release-bot, nota di rilascio: minor validation cleanup for route owner lookup.",
      "Non sono previste interruzioni di servizio. Se compaiono anomalie sui route owner, verificare prima i mapping legacy.",
    ],
    objective: "Capire se esiste una correlazione temporale tra deploy ed errori.",
    dataset: ["tmp_echo_diag.csv"],
    aiPrompt: `Sono arrivata alle 07:42.
Dovevo solo pulire una validazione.
Ma dopo il mio arrivo, il traffico ha iniziato a cadere.

Sono breve, comincio con una lettera e finisco con due numeri.`,
    splunkQueries: [
      {
        title: "Errori prima / dopo v27",
        query: `| inputlookup tmp_echo_diag.csv
| eval event_epoch=strptime(event_time,"%Y-%m-%d %H:%M:%S")
| eval clean_status=upper(trim(status))
| eval is_error=if(clean_status="KO" OR clean_status="ERROR" OR clean_status="FAIL" OR clean_status="FAILED" OR error_code!="200",1,0)
| search service="mso-router" host="edge-03" BB_ID="BB-042"
| eval period=if(event_epoch>=strptime("2026-05-22 07:42:00","%Y-%m-%d %H:%M:%S"),"after_v27","before_v27")
| stats count as total_events sum(is_error) as error_events avg(latency_ms) as avg_latency by period deployment_version
| eval error_rate=round((error_events/total_events)*100,2)
| sort period`,
      },
    ],
    expectedAnswers: ["v27", "2026-05-22 07:42:00", "v27 2026-05-22 07:42:00"],
    expectedFragment: "V27",
    hints: ["È breve, comincia con una lettera e finisce con due numeri."],
    successMessage: "Versione sospetta: v27 — 2026-05-22 07:42:00.",
  },
  {
    id: "E",
    code: "E",
    order: 5,
    title: "Il trattino scomparso",
    subtitle: "Piccolo, orizzontale, ignorato",
    artifactImage: `${IMG}step5.png`,
    briefing: [
      "Durante l'incidente è stato richiesto un controllo sui mapping legacy.",
      "Il file di mapping collega: BB_ID, route_owner, preferred_host, fallback_host.",
      "Le esportazioni legacy hanno sempre avuto piccoli problemi di formato. Di solito sono innocui. Di solito.",
      "La mascotte Milo è stata vista sulla scrivania del team mapping. Vicino a lei c'erano etichette stampate con alcuni BB_ID. Probabilmente irrilevante.",
    ],
    objective:
      "Verificare se il BB_ID coinvolto nell'incidente è coerente con il mapping legacy.",
    dataset: ["tmp_echo_mapping.csv"],
    aiPrompt: `Non sono una lettera.
Non sono un numero.
Sono piccolo, orizzontale e spesso ignorato.

Se sparisco da BB-042,
il sistema vede BB042.

In inglese mi chiamano?`,
    splunkQueries: [
      {
        title: "Audit mapping legacy",
        query: `| inputlookup tmp_echo_mapping.csv
| eval raw_BB_ID=upper(trim(BB_ID))
| eval expected_BB_ID=upper(trim(normalized_expected))
| eval bb_digits=replace(raw_BB_ID,"[^0-9]","")
| eval normalized_BB_ID=if(len(bb_digits)=3,"BB-".bb_digits,raw_BB_ID)
| eval is_dirty=if(raw_BB_ID!=expected_BB_ID OR raw_BB_ID!=normalized_BB_ID,1,0)
| search normalized_BB_ID="BB-042" OR expected_BB_ID="BB-042"
| table raw_BB_ID normalized_BB_ID expected_BB_ID route_owner preferred_host fallback_host quality_flag is_dirty`,
      },
    ],
    expectedAnswers: ["bb042", "bb-042", "hyphen", "trattino"],
    expectedFragment: "HY",
    hints: ["Non è una lettera, non è un numero. È piccolo, orizzontale e spesso ignorato."],
    successMessage: "Trattino mancante: BB042 → BB-042.",
  },
  {
    id: "F",
    code: "F",
    order: 6,
    title: "Human Approval",
    subtitle: "L'ultimo frammento è una decisione",
    artifactImage: `${IMG}step6.png`,
    briefing: [
      "Il team ha raccolto evidenze sufficienti. Per aprire la cassaforte Echo serve una validazione umana.",
      "Create un flow Power Automate manuale che raccolga i dati principali dell’incidente da un file Excel e li invii tramite chatbot Teams ad Andrea al fine di richiedere approval per la remediation.",
      "Il file Excel è disponibile su SharePoint. Il messaggio Teams deve contenere tutti i campi obbligatori, valorizzati tramite Dynamic Content dove indicato.",
    ],
    objective: "Costruire un flow Power Automate manuale che raccolga i dati principali dell’incidente da un file Excel e li invii tramite chatbot Teams ad Andrea per richiedere approval sulla remediation.",
    dataset: [],
    links: [
      {
        label: "Workshop PA.xlsx",
        url: "https://skyglobal.sharepoint.com/:x:/r/sites/SMC/Shared%20Documents/Workshop%2004/Workshop%20PA.xlsx?d=w762b31310378465c92004f4f6b456cf1&csf=1&web=1&e=PUUYJE",
      },
    ],
    aiPrompt: `Dopo l’invio corretto del messaggio Teams, rispondi con l’indovinello:
Non sono un log, non sono un ticket, non sono una versione.
Sono il giorno in cui il workshop prende vita.
Se vuoi aprire l’ultimo frammento, trova il numero della data giusta.
`,
    splunkQueries: [
      {
        title: "Trigger fields Power Automate",
        query: `team_name
service
host
ticket_id
BB_ID
deployment_version
dirty_mapping
splunk_evidence
root_cause_hypothesis
recommended_action`,
      },
    ],
    expectedAnswers: ["4"],
    expectedFragment: "AP",
    hints: ["L’ultimo frammento non è nei log. È nella decisione umana. Trova il numero del giorno del workshop."],
    successMessage: "Approval ottenuto. Remediation autorizzata.",
    extra: `Messaggio Teams atteso ad Andrea:

Ciao Andrea,

abbiamo completato l’analisi dell’incidente Operazione Echo.

Evidenze principali:
- chiave segreta: [Dynamic Content]
- servizio impattato: [Dynamic Content]
- host coinvolto: [Dynamic Content]
- ticket principale: [Dynamic Content]
- BB_ID coinvolto: [Dynamic Content]
- versione sospetta: [Dynamic Content]
- anomalia dati: [ Scrivere qui ]
- impatto osservato: [ Scrivere qui ]

Ipotesi root cause:
[ Scrivere qui la vostra ipotesi ]

Azione consigliata:
[ Scrivere qui la vostra azione consigliata ]

Richiediamo approval all’indirizzo andrea.fumagalli@skytv.it per procedere con la remediation.

Gli organizzatori risponderanno solo se la richiesta sarà conforme.`,
  },
];

export const rootCauseSteps = [
  "Milo non ha mangiato un cavo.",
  "Ha mangiato il trattino.",
  "BB-042 è diventato BB042 nel mapping legacy.",
  "La release v27 non accetta più ID sporchi.",
  "La lookup del route_owner fallisce.",
  "Il traffico va in fallback su edge-03.",
  "Risultato: errori 503 e latenza alta su mso-router.",
  "Azione: rollback v27 su edge-03, normalizzazione BB_ID, controllo qualità sui mapping legacy, monitoraggio per 30 minuti.",
];

export const debrief = [
  "Splunk ha trovato i fatti.",
  "L'AI ha accelerato il ragionamento.",
  "Power Automate ha trasformato l'indagine in processo.",
  "E Milo ha dimostrato che a volte un incidente nasce da un solo carattere mancante.",
];
