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
};

export const FINAL_CODE = "MS-E3-42-V27-HY-AP";
export const VAULT_KEY = "MILO-042";
export const FACILITATOR_CODE = "ECHO-ADMIN";

export const challenges: Challenge[] = [
  {
    id: "A",
    code: "A",
    order: 1,
    title: "Il servizio che urla",
    subtitle: "Volume non è gravità",
    artifactImage: "/assets/echo-workshop/step1.svg",
    briefing: [
      "Durante la finestra 06:30 - 09:30 sono stati osservati diversi segnali anomali sui servizi Echo.",
      "Il volume totale degli eventi non è sufficiente per identificare il servizio impattato: alcuni servizi parlano molto, ma non sbagliano davvero.",
      "Nota operativa: non fidatevi del servizio più rumoroso. Cercate quello con il peggior error rate.",
    ],
    objective:
      "Identificare il servizio che presenta il peggior rapporto tra errori e volume totale.",
    dataset: ["tmp_echo_diag.csv", "echo_diag.csv"],
    aiPrompt: `Agisci come un Incident Analyst.

Ti passo una tabella Splunk con:
service, total_events, error_events, avg_latency, error_rate.

Devi spiegare quale servizio è più sospetto.

Dividi la risposta in:
1. Evidenze oggettive
2. Ipotesi
3. Perché il volume totale non basta
4. Query successive consigliate

Non inventare dati non presenti.`,
    splunkQueries: [
      {
        title: "Error rate per servizio",
        query: `| inputlookup echo_diag.csv
| eval clean_status=upper(trim(status))
| eval is_error=if(clean_status="KO" OR clean_status="ERROR" OR clean_status="FAIL" OR clean_status="FAILED" OR error_code!="200",1,0)
| stats count as total_events sum(is_error) as error_events avg(latency_ms) as avg_latency by service
| eval error_rate=round((error_events/total_events)*100,2)
| sort -error_rate`,
      },
    ],
    expectedAnswers: ["mso-router", "mso_router", "msorouter"],
    expectedFragment: "MS",
    hints: ["Il servizio più rumoroso non è sempre quello più fragile."],
    successMessage: "Servizio identificato: mso-router.",
  },
  {
    id: "B",
    code: "B",
    order: 2,
    title: "Il log indecifrabile",
    subtitle: "Tre maschere, un solo nodo",
    artifactImage: "/assets/echo-workshop/step2.svg",
    briefing: [
      "I log grezzi sono stati esportati in emergenza. Il parser ufficiale non funziona.",
      "Tutti gli eventi sono finiti dentro una singola colonna. Prima di capire cosa è successo, bisogna ricostruire il linguaggio dei log.",
      "Problemi noti: separatori incoerenti, timestamp in formati diversi, host scritti in modi diversi, ticket scritti in modi diversi, BB_ID scritti in modi diversi, latency a volte non numerica.",
      "edge-03, edge03, EDGE_03: tre maschere, un solo nodo.",
    ],
    objective:
      "Normalizzare i log e identificare l'host più coinvolto negli errori del servizio sospetto.",
    dataset: ["tmp_echo_logs.csv", "echo_logs_raw.csv"],
    aiPrompt: `Ho un CSV Splunk lookup con una colonna raw_event contenente log sporchi.

Esempi:
- svc=mso-router|host=edge-03|sev=ERROR|code=503
- service : MSO Router host=edge03 severity=err http=503
- service=mso_router;node=edge_03;level=ERROR;http_code=503

Scrivimi una strategia SPL per normalizzare:
service
host
severity
http_code
latency_ms

Usa eval, rex, match e case.
Non inserire commenti nella SPL.`,
    splunkQueries: [
      {
        title: "Normalizzazione log e top host",
        query: `| inputlookup echo_logs_raw.csv
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
    artifactImage: "/assets/echo-workshop/step3.svg",
    briefing: [
      "L'ITSM ha esportato alcuni ticket aperti nella finestra dell'incidente. Uno dei ticket compare più volte, ma non sempre nello stesso formato.",
      "Possibili anomalie: maiuscole/minuscole incoerenti, trattino mancante, spazi finali, owner mancante, descrizioni simili ma non identiche.",
      "Il ticket fantasma non è duplicato per errore. È duplicato perché nessuno lo ha normalizzato.",
    ],
    objective: "Identificare il ticket principale e il BB_ID collegato.",
    dataset: ["echo_tickets.csv", "echo_logs_raw.csv"],
    aiPrompt: `Ti passo risultati Splunk su:
ticket_id, hits, BB_ID, http_codes, descriptions.

Devi capire quale ticket è probabilmente collegato all'incidente.

Regole:
- Non inventare dati
- Evidenzia il ticket più ricorrente
- Evidenzia problemi di data quality
- Spiega se il ticket sembra causa, effetto o contenitore dell'incidente
- Suggerisci la prossima query Splunk`,
    splunkQueries: [
      {
        title: "Correlazione ticket / BB_ID",
        query: `| inputlookup echo_logs_raw.csv
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
    artifactImage: "/assets/echo-workshop/step4.svg",
    briefing: [
      "Un deploy non è una colpa. Ma ogni cambiamento lascia un'ombra.",
      "Mail release-bot — Ciao team, il deploy della versione v27 è stato completato sui nodi previsti.",
      "Dettagli: servizio mso-router, host edge-03, orario 2026-05-22 07:42:00, owner release-bot, nota di rilascio: minor validation cleanup for route owner lookup.",
      "Non sono previste interruzioni di servizio. Se compaiono anomalie sui route owner, verificare prima i mapping legacy.",
    ],
    objective: "Capire se esiste una correlazione temporale tra deploy ed errori.",
    dataset: ["echo_deployments.csv", "echo_diag.csv"],
    aiPrompt: `Ho una timeline con eventi prima e dopo un deploy.

I campi sono:
period, deployment_version, total_events, error_events, avg_latency, error_rate.

Scrivi una root cause hypothesis prudente.

Devi distinguere:
- correlazione temporale
- evidenze tecniche
- cosa manca per confermare causalità
- azione consigliata immediata

Non dire che la causa è certa se i dati mostrano solo correlazione.`,
    splunkQueries: [
      {
        title: "Deploy timeline",
        query: `| inputlookup echo_deployments.csv
| search service="mso-router" host="edge-03"
| eval deploy_epoch=strptime(deploy_time,"%Y-%m-%d %H:%M:%S")
| sort deploy_epoch
| table deploy_time service host version actor change_note`,
      },
      {
        title: "Errori prima / dopo v27",
        query: `| inputlookup echo_diag.csv
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
    artifactImage: "/assets/echo-workshop/step5.svg",
    briefing: [
      "Durante l'incidente è stato richiesto un controllo sui mapping legacy.",
      "Il file di mapping collega: BB_ID, route_owner, preferred_host, fallback_host.",
      "Le esportazioni legacy hanno sempre avuto piccoli problemi di formato. Di solito sono innocui. Di solito.",
      "La mascotte Milo è stata vista sulla scrivania del team mapping. Vicino a lei c'erano etichette stampate con alcuni BB_ID. Probabilmente irrilevante.",
    ],
    objective:
      "Verificare se il BB_ID coinvolto nell'incidente è coerente con il mapping legacy.",
    dataset: ["echo_mapping_dirty.csv"],
    aiPrompt: `Ti passo una tabella di mapping con:
raw_BB_ID, normalized_BB_ID, expected_BB_ID, route_owner, preferred_host, fallback_host, quality_flag.

Devi spiegare il rischio operativo di avere BB042 invece di BB-042.

Collega il problema a:
- lookup fallita
- route_owner vuoto
- fallback_host
- possibili errori 503
- data quality

Scrivi la spiegazione come se fosse per un team tecnico-operativo.`,
    splunkQueries: [
      {
        title: "Audit mapping legacy",
        query: `| inputlookup echo_mapping_dirty.csv
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
    hints: [
      "Non è una lettera, non è un numero. È piccolo, orizzontale e spesso ignorato.",
    ],
    successMessage: "Trattino mancante: BB042 → BB-042.",
  },
  {
    id: "F",
    code: "F",
    order: 6,
    title: "Human Approval",
    subtitle: "L'ultimo frammento è una decisione",
    artifactImage: "/assets/echo-workshop/step6.svg",
    briefing: [
      "Il team ha raccolto evidenze sufficienti. Per aprire la cassaforte Echo serve una validazione umana.",
      "Create un flow Power Automate che raccolga i dati principali dell'incidente, generi una sintesi operativa con AI, mandi una mail ad Andrea e richieda approval per la remediation.",
      "Andrea risponderà solo se la mail contiene tutti i campi richiesti dal trigger.",
    ],
    objective:
      "Costruire il flow Power Automate e ottenere l'approval umano sulla remediation.",
    dataset: ["trigger fields", "mail draft", "approval connector"],
    aiPrompt: `Sei un Incident Manager.

Crea una sintesi operativa usando solo i dati forniti.

Dati:
Team: @{triggerBody()?['team_name']}
Service: @{triggerBody()?['service']}
Host: @{triggerBody()?['host']}
Ticket: @{triggerBody()?['ticket_id']}
BB_ID: @{triggerBody()?['BB_ID']}
Versione: @{triggerBody()?['deployment_version']}
Mapping sporco: @{triggerBody()?['dirty_mapping']}
Evidenze Splunk: @{triggerBody()?['splunk_evidence']}
Ipotesi root cause: @{triggerBody()?['root_cause_hypothesis']}
Azione consigliata: @{triggerBody()?['recommended_action']}

Output richiesto:
1. Titolo incidente
2. Severità stimata
3. Impatto
4. Evidenze principali
5. Causa probabile
6. Azione consigliata
7. Testo email per richiesta approval

Regole:
- Non inventare dati
- Se qualcosa non è dimostrato, scrivi "ipotesi"
- Usa tono operativo e chiaro`,
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
    expectedAnswers: ["approval process", "approval", "approvalprocess", "human approval"],
    expectedFragment: "AP",
    hints: ["L'ultimo frammento non è nei log. È nella decisione umana."],
    successMessage: "Approval ottenuto. Remediation autorizzata.",
    extra: `Mail attesa ad Andrea:

Ciao Andrea,

abbiamo completato l'analisi dell'incidente Operazione Echo.

Evidenze principali:
- servizio impattato: mso-router
- host coinvolto: edge-03
- ticket principale: INC-4721
- BB_ID coinvolto: BB-042
- versione sospetta: v27
- anomalia dati: nel mapping legacy BB-042 risulta presente come BB042
- impatto osservato: aumento errori 503 e latenza dopo il deploy v27

Ipotesi root cause:
la release v27 sembra avere una validazione più rigida sugli ID. Il valore sporco BB042 non viene riconosciuto come BB-042, quindi la lookup del route_owner fallisce e il traffico va in fallback su edge-03.

Azione consigliata:
approvare rollback della v27 su edge-03, normalizzare il mapping BB_ID e monitorare error_rate e latenza per 30 minuti.

Richiediamo approval per procedere con la remediation.`,
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
