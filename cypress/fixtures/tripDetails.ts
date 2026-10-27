import { TripDetails, AdminTripDetails } from "@/_types/trip";

export const trips: TripDetails[] = [

  {
    name: "TRP-2025-042",
    start: "2025-10-08T06:00:00.000Z",
    end: "2025-10-08T18:30:00.000Z",
    location: [50.37, -4.14],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 2,
    gps: [
      { time: "2025-10-08T06:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 },
      { time: "2025-10-08T12:40:00.000Z", latitude: 50.37, longitude: 4.14, speed: 6.60, course: 190.00 },
      { time: "2025-10-08T17:50:00.000Z", latitude: 50.37, longitude: 4.14, speed: 6.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-10-08T06:40:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["aud1"],
        transcriptFileIds: ["t1"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-10-08T17:40:00.000Z", videoFileIds: [], audioFileIds: [],
        transcriptFileIds: [], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-3", type: "alert", name: "A-001", latitude: 50.37, longitude: 4.14,
        time: "2025-10-08T10:40:00.000Z", videoFileIds: [], audioFileIds: [],
        transcriptFileIds: [], speciesDetected: []
      }
    ]
  },

  {
    name: "TRP-2025-041",
    start: "2025-10-05T05:45:00.000Z",
    end: "2025-10-05T19:15:00.000Z",
    location: [50.35, -4.12],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 0,
    gps: [
      { time: "2025-10-05T06:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: []
  },

  {
    name: "TRP-2025-040",
    start: "2025-10-02T06:30:00.000Z",
    end: "2025-10-02T17:00:00.000Z",
    location: [50.38, -4.15],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 0,
    gps: [
      { time: "2025-10-02T06:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: []
  },

  {
    name: "TRP-2025-039",
    start: "2025-09-28T07:00:00.000Z",
    end: "2025-09-28T20:30:00.000Z",
    location: [50.36, -4.10],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 3,
    gps: [
      { time: "2025-09-28T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-28T08:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-09-28T12:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-3", type: "bycatch", name: "BC-003", latitude: 50.37, longitude: 4.14,
        time: "2025-09-28T17:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-038",
    start: "2025-09-25T06:15:00.000Z",
    end: "2025-09-25T18:45:00.000Z",
    location: [50.37, -4.13],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 1,
    gps: [
      { time: "2025-09-25T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-25T10:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-037",
    start: "2025-09-22T05:30:00.000Z",
    end: "2025-09-22T16:00:00.000Z",
    location: [50.39, -4.16],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 1,
    gps: [
      { time: "2025-09-22T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-22T09:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-036",
    start: "2025-09-19T06:45:00.000Z",
    end: "2025-09-19T19:30:00.000Z",
    location: [50.35, -4.11],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 2,
    gps: [
      { time: "2025-09-19T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-19T09:00:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-09-19T14:00:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-035",
    start: "2025-09-15T07:15:00.000Z",
    end: "2025-09-15T21:00:00.000Z",
    location: [50.34, -4.09],
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    bycatchEventCount: 2,
    gps: [
      { time: "2025-09-15T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-15T10:15:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-09-15T16:00:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  }

];

export const adminTrips: AdminTripDetails[] = [

  {
    name: "TRP-2025-042",
    vesselId: "VSL-001",
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    start: "2025-10-08T06:00:00.000Z",
    end: "2025-10-08T18:30:00.000Z",
    location: [50.37, -4.14],
    bycatchEventCount: 2,
    gps: [
      { time: "2025-10-08T06:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 },
      { time: "2025-10-08T12:40:00.000Z", latitude: 50.37, longitude: 4.14, speed: 6.60, course: 190.00 },
      { time: "2025-10-08T17:50:00.000Z", latitude: 50.37, longitude: 4.14, speed: 6.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-10-08T06:40:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["aud1"],
        transcriptFileIds: ["t1"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-10-08T17:40:00.000Z", videoFileIds: [], audioFileIds: [],
        transcriptFileIds: [], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-3", type: "alert", name: "A-001", latitude: 50.37, longitude: 4.14,
        time: "2025-10-08T10:40:00.000Z", videoFileIds: [], audioFileIds: [],
        transcriptFileIds: [], speciesDetected: []
      }
    ]
  },

  {
    name: "TRP-2025-041",
    vesselId: "VSL-002",
    vesselName: "FV Ocean Voyager",
    vesselRegistration: "OCE-1234",
    start: "2025-10-05T05:45:00.000Z",
    end: "2025-10-05T19:15:00.000Z",
    location: [50.35, -4.12],
    bycatchEventCount: 0,
    gps: [
      { time: "2025-10-05T06:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: []
  },

  {
    name: "TRP-2025-040",
    vesselId: "VSL-003",
    vesselName: "FV Wave Rider",
    vesselRegistration: "WAV-1234",
    start: "2025-10-02T06:30:00.000Z",
    end: "2025-10-02T17:00:00.000Z",
    location: [50.38, -4.15],
    bycatchEventCount: 0,
    gps: [
      { time: "2025-10-02T06:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: []
  },

  {
    name: "TRP-2025-039",
    vesselId: "VSL-004",
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    start: "2025-09-28T07:00:00.000Z",
    end: "2025-09-28T20:30:00.000Z",
    location: [50.36, -4.10],
    bycatchEventCount: 3,
    gps: [
      { time: "2025-09-28T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-28T08:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-09-28T12:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-3", type: "bycatch", name: "BC-003", latitude: 50.37, longitude: 4.14,
        time: "2025-09-28T17:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-038",
    vesselId: "VSL-001",
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    start: "2025-09-25T06:15:00.000Z",
    end: "2025-09-25T18:45:00.000Z",
    location: [50.37, -4.13],
    bycatchEventCount: 1,
    gps: [
      { time: "2025-09-25T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-25T10:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-037",
    vesselId: "VSL-001",
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    start: "2025-09-22T05:30:00.000Z",
    end: "2025-09-22T16:00:00.000Z",
    location: [50.39, -4.16],
    bycatchEventCount: 1,
    gps: [
      { time: "2025-09-22T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-22T09:45:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-036",
    vesselId: "VSL-001",
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    start: "2025-09-19T06:45:00.000Z",
    end: "2025-09-19T19:30:00.000Z",
    location: [50.35, -4.11],
    bycatchEventCount: 2,
    gps: [
      { time: "2025-09-19T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-19T09:00:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-09-19T14:00:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  },

  {
    name: "TRP-2025-035",
    vesselId: "VSL-001",
    vesselName: "FV Sea Explorer",
    vesselRegistration: "SEA-1234",
    start: "2025-09-15T07:15:00.000Z",
    end: "2025-09-15T21:00:00.000Z",
    location: [50.34, -4.09],
    bycatchEventCount: 2,
    gps: [
      { time: "2025-09-15T07:30:00.000Z", latitude: 50.37, longitude: 4.14, speed: 5.60, course: 190.00 }
    ],
    recordings: [
      {
        id: "alert-1", type: "bycatch", name: "BC-001", latitude: 50.37, longitude: 4.14,
        time: "2025-09-15T10:15:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      },
      {
        id: "alert-2", type: "bycatch", name: "BC-002", latitude: 50.37, longitude: 4.14,
        time: "2025-09-15T16:00:00.000Z", videoFileIds: ["abc1"], audioFileIds: ["abc2"],
        transcriptFileIds: ["abc3"], speciesDetected: ["dolphin"]
      }
    ]
  }

];
