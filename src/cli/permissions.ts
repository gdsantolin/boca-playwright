export const categorizedMethods = {
  Contests: [
    'activateContest',
    'createContest',
    'getContest',
    'getContests',
    'updateContest'
  ],
  Answers: [
    'createAnswer',
    'deleteAnswer',
    'deleteAnswers',
    'getAnswer',
    'getAnswers',
    'updateAnswer'
  ],
  Languages: [
    'createLanguage',
    'deleteLanguage',
    'deleteLanguages',
    'getLanguage',
    'getLanguages',
    'updateLanguage'
  ],
  Problems: [
    'createProblem',
    'deleteProblem',
    'deleteProblems',
    'disableProblem',
    'disableProblems',
    'downloadProblem',
    'enableProblem',
    'enableProblems',
    'getProblem',
    'getProblems',
    'restoreProblem',
    'restoreProblems',
    'updateProblem'
  ],
  Sites: [
    'createSite',
    'disableLoginSite',
    'enableLoginSite',
    'getSite',
    'getSites',
    'forceLogoffSite',
    'updateSite'
  ],
  Users: [
    'createUser',
    'deleteUser',
    'deleteUsers',
    'disableUser',
    'disableUsers',
    'enableUser',
    'enableUsers',
    'getUser',
    'getUsers',
    'importUsers',
    'restoreUser',
    'restoreUsers',
    'updateUser'
  ],
  Runs: ['downloadRuns', 'downloadRun', 'getRun', 'getRuns', 'submitRun']
} as const;

export const rolePermissions = {
  System: ['Contests'],
  Admin: ['Answers', 'Languages', 'Problems', 'Sites', 'Users', 'Runs'],
  Team: ['Problems', 'Runs']
} as const;

// Team users are allowed to access only a subset of methods
export const teamAllowedMethods = [
  'getProblem',
  'getProblems',
  'downloadProblem',
  'getRuns',
  'getRun',
  'submitRun'
];

// Admin users access most methods, but not 'submitRun'
export const adminDeniedMethods = ['submitRun'];
