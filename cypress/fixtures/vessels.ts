import { AdminVessel, Vessel, VesselMinimal } from "@/_types/vessel";

export const mockVesselMinimal: VesselMinimal[] = [
  { id: 1, name: 'Ocean Explorer', registration: 'OE-001' },
  { id: 2, name: 'Sea Voyager', registration: 'SN-001' },
  { id: 3, name: 'Pacific Wanderer', registration: 'WR-003' },
]
export const mockVessels: Vessel[] = [
  {
    name: 'Ocean Explorer',
    registration: 'OE-123',
    lastPosition: {
      longitude: -122.4194,
      latitude: 37.7749,
      time: '2024-01-15T10:30:00Z'
    },
    lastRecording: {
      type: 'bycatch',
      time: '2024-01-15T09:00:00Z'
    }
  },
  {
    name: 'Sea Voyager',
    registration: 'SV-456',
    lastPosition: {
      longitude: -118.2437,
      latitude: 34.0522,
      time: '2024-01-14T15:45:00Z'
    },
    lastRecording: {
      type: 'alert',
      time: '2024-01-14T14:30:00Z'
    }
  },
  {
    name: 'Pacific Wanderer',
    registration: 'PW-789',
    lastPosition: {
      longitude: -157.8583,
      latitude: 21.3099,
      time: '2024-01-13T08:20:00Z'
    },
    lastRecording: {
      type: null,
      time: null
    }
  },
  {
    name: 'Atlantic Trader',
    registration: 'AT-101',
    lastPosition: {
      longitude: null,
      latitude: null,
      time: null
    },
    lastRecording: {
      type: null,
      time: null
    }
  }
];

export const mockAdminVessels: AdminVessel[] = [
  {
    id: 1,
    name: 'Ocean Explorer',
    registration: 'REG-001',
    lastPosition: {
      longitude: -122.4194,
      latitude: 37.7749,
      time: '2024-01-15T10:30:00Z'
    },
    lastRecording: {
      type: 'bycatch',
      time: '2024-01-15T09:00:00Z'
    }
  },
  {
    id: 2,
    name: 'Sea Navigator',
    registration: 'REG-002',
    lastPosition: {
      longitude: -118.2437,
      latitude: 34.0522,
      time: '2024-01-14T15:45:00Z'
    },
    lastRecording: {
      type: 'alert',
      time: '2024-01-14T14:30:00Z'
    }
  },
  {
    id: 3,
    name: 'Wave Rider',
    registration: 'REG-003',
    lastPosition: {
      longitude: -157.8583,
      latitude: 21.3099,
      time: '2024-01-13T08:20:00Z'
    },
    lastRecording: {
      type: null,
      time: null
    }
  },
];
