export const APP_STATUS = Object.freeze({
  RUNNING: 'running',
  STOPPED: 'stopped'
});

export const INTENT = Object.freeze({
  USER_INFO: 'user-info',
  GET_REPLACING_INFO: 'get-replacing-info',
  GET_APP_STATUS: 'get-app-status',
  PUSH_APP_STATUS: 'push-app-status',
  GET_TB_STAGES: 'get-tb-stages',
  PUSH_LOG: 'push-log',
  GET_LOG: 'get-log'
});

export const TB_STAGE_FOLDERS = Object.freeze({
  PRENATAL: 'TB_Stages_Prenatal',
  POSTNATAL: 'TB_Stages_Postnatal'
});

export const TB_STAGES = Object.freeze([
  {
    folder: TB_STAGE_FOLDERS.PRENATAL,
    name: 'Tri 1 = Weeks 4-13',
    weeksRange: [4, 13]
  },
  {
    folder: TB_STAGE_FOLDERS.PRENATAL,
    name: 'Tri 2 = Weeks 14-27',
    weeksRange: [14, 27]
  },
  {
    folder: TB_STAGE_FOLDERS.PRENATAL,
    name: 'Tri 3 = Week 28-40',
    weeksRange: [28, 40]
  },
  {
    folder: TB_STAGE_FOLDERS.POSTNATAL,
    name: 'Post 0-3 = Weeks 0-15',
    weeksRange: [0, 15]
  },
  {
    folder: TB_STAGE_FOLDERS.POSTNATAL,
    name: 'Post 4-6 = Weeks 16-27',
    weeksRange: [16, 27]
  },
  {
    folder: TB_STAGE_FOLDERS.POSTNATAL,
    name: 'Post 7-12 = Weeks 28-52',
    weeksRange: [28, 52]
  }
]);
