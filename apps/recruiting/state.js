// The durable hiring workspace's name. One project can hold several searches over time.
const PROJECT_NAME = 'Product Design Hiring';

// One search state. The conversation and the filters both read and write this.
const SearchState = (function () {
  const blank = {
    id: 'search-001',

    // loaded data
    company: null, team: null, candidates: [], jd: null,

    // S1
    prompt: '',
    attachments: [],
    scenario: null,

    // S2 — shape varies by scenario
    scenarioContext: {},

    // S3
    hypothesis: null,
    criteria: [],
    clarifications: [],

    // S4 + refinement
    calibration: [],
    learned: [],

    // S5
    filters: {},
    shortlist: [],
    shortlistRecord: null,
    results: [],

    // Project-scoped recurring searches
    tasks: [],

    // Project-scoped outreach drafts, keyed by candidate id
    outreachDrafts: {},
    outreachStrategy: null,
    outreachGroup: null,

    // the conversational spine
    thread: [],
  };

  let state = { ...blank };
  const subs = new Set();

  function emit() { subs.forEach(fn => fn(state)); }

  return {
    get: () => state,
    set(patch) {
      state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
      emit();
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },

    // append a turn to the thread — user turns and Ema turns both land here,
    // whether they came from typing or from direct manipulation
    push(turn) {
      state = { ...state, thread: [...state.thread, { ...turn, at: Date.now() }] };
      emit();
    },

    // keep loaded data, drop everything the user built
    reset() {
      const { company, team, candidates, jd, tasks, outreachDrafts, outreachStrategy } = state;
      state = { ...blank, id: `search-${Date.now()}`, company, team, candidates, jd, tasks, outreachDrafts, outreachStrategy };
      emit();
    },
  };
})();

function useSearchState() {
  const [s, setS] = React.useState(SearchState.get());
  React.useEffect(() => SearchState.subscribe(setS), []);
  return s;
}
