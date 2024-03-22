/**
 * In which we define some constants which define overall behavior in the system.
 */

// The initial path element(s) for Europa paths which target kbase-ui, i.e. "legacy".
// Although this is somewhat "configurable", in reality it is hard-coded in Europa, both
// in the sense of being defined in code (in an exported constant), but also used
// literally in various parts of the codebase.
// This means we don't need to treat it as truly configurable.
export const LEGACY_PATH = "legacy";