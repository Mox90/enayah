// enayah-frontend/src/modules/hr/onboarding/stores/onboarding-draft.store.ts

import { create } from 'zustand'

import type { HireEmployeePayload } from '../types/onboarding.types'

export function createInitialOnboardingDraft(): HireEmployeePayload {
  return {
    employee: {
      employeeNumber: '',
      firstNameEn: '',
      secondNameEn: null,
      thirdNameEn: null,
      familyNameEn: '',
      firstNameAr: '',
      secondNameAr: null,
      thirdNameAr: null,
      familyNameAr: '',
      gender: 'male',
      dateOfBirth: null,
      countryId: null,
      countryNameEn: '',
      countryNameAr: '',
    },

    personal: {
      identifications: [],
      emails: [],
      phoneNumbers: [],
      dependents: [],
      addresses: [],
      emergencyContacts: [],
      visas: [],
    },

    employment: {
      hireDate: '',
      startDate: '',
      endDate: null,
      employmentType: 'full_time',
      staffCategory: 'contractual',
    },

    contract: {
      contractNumber: null,
      startDate: '',
      endDate: '',
      contractType: 'initial',
      status: 'active',
      signedDate: null,
      documentPath: null,
      notes: null,
    },

    movement: {
      positionItemId: null,
      itemNumber: null,
      startDate: '',
      remarks: '',
      endDate: '',
      sequenceNumber: 1,
      movementType: 'initial',
    },

    appointment: {
      actualDepartmentId: null,
      actualPositionId: null,
      managerId: null,
      startDate: '',
      endDate: null,
      appointmentType: 'primary',
      assignmentReason: 'management_decision',
      remarks: null,
      approvedBy: null,
      approvedAt: null,
    },

    compensation: undefined,

    allowances: [],

    credentials: {
      degrees: [],
      boards: [],
      fellowships: [],
      memberships: [],
      licenses: [],
      lifeSupport: [],
      malpractice: [],
    },
  }
}

type DraftUpdater =
  | HireEmployeePayload
  | ((previous: HireEmployeePayload) => HireEmployeePayload)

interface OnboardingDraftState {
  draft: HireEmployeePayload

  setDraft: (value: DraftUpdater) => void

  resetDraft: () => void
}

export const useOnboardingDraftStore = create<OnboardingDraftState>((set) => ({
  draft: createInitialOnboardingDraft(),

  setDraft: (value) => {
    set((state) => ({
      draft: typeof value === 'function' ? value(state.draft) : value,
    }))
  },

  resetDraft: () => {
    set({
      draft: createInitialOnboardingDraft(),
    })
  },
}))
